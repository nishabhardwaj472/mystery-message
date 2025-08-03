import UserModel from '@/models/User';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/dbConnect';
import { User } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function DELETE(
  request: Request,
  { params }: { params: { messageid: string } }
) {
  const { messageid } = params;
  await dbConnect();
  const session = await getServerSession(authOptions);
  const _user = session?.user as User;

  if (!session || !_user) {
    return Response.json({ success: false, message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const updateResult = await UserModel.updateOne(
      { _id: _user._id },
      { $pull: { messages: { _id: messageid } } }
    );

    if (updateResult.modifiedCount === 0) {
      return Response.json({ success: false, message: 'Message not found or already deleted' }, { status: 404 });
    }

    return Response.json({ success: true, message: 'Message deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting message:', error);
    return Response.json({ success: false, message: 'Error deleting message' }, { status: 500 });
  }
}
