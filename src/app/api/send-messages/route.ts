import UserModel from '@/models/User';
import dbConnect from '@/lib/dbConnect';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, content } = await request.json();

    if (!username || !content || !content.trim()) {
      return Response.json(
        { message: 'Username and message content are required', success: false },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({ username }).exec();

    if (!user) {
      return Response.json(
        { message: 'User not found', success: false },
        { status: 404 }
      );
    }

    // ✅ Match field name from DB
    if (user.isAcceptingMessages !== true) {
      return Response.json(
        { message: 'User is not accepting messages', success: false },
        { status: 403 }
      );
    }

    const newMessage = {
      content: content.trim(),
      createdAt: new Date(),
    };

    user.messages.push(newMessage as any);
    await user.save();

    return Response.json(
      { message: 'Message sent successfully', success: true },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding message:', error);
    return Response.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}
