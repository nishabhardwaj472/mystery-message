import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  await dbConnect();

  const { username } = params;

  try {
    const user = await UserModel.findOne({ username }).select("isAcceptingMessages");

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        isAcceptingMessages: user.isAcceptingMessages
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user status:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
