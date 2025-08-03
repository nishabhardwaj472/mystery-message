// src/app/api/get-messages/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import mongoose from "mongoose";
import { User } from "next-auth";

export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      { success: false, message: "Not Authenticated" },
      { status: 401 }
    );
  }

  try {
    const userId = new mongoose.Types.ObjectId(user._id);

    const userData = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: "$messages" },
      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } }
    ]);

    if (!userData || userData.length === 0) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // ✅ Convert createdAt to string
    const formattedMessages = userData[0].messages.map((msg: any) => ({
      _id: msg._id?.toString() || "",
      content: msg.content || "",
      createdAt: msg.createdAt
        ? new Date(msg.createdAt).toISOString()
        : ""
    }));

    return Response.json(
      { success: true, messages: formattedMessages },
      { status: 200 }
    );
  } catch (error) {
    console.error("An unexpected error occurred: ", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
