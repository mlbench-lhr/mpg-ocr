import { NextResponse } from 'next/server';
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const { ids } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No valid IDs provided for deletion' }, { status: 400 });
    }

    const objectIds = ids.map((id) => new ObjectId(id));

    const client = await clientPromise;
    const db = client.db('my-next-app');

    // Perform deletion in the database
    const result = await db.collection('mockData').deleteMany({ _id: { $in: objectIds } });

    return NextResponse.json({
      message: 'Rows deleted successfully',
      deletedCount: result.deletedCount,
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting rows:', error);
    return NextResponse.json({ error: 'Failed to delete rows' }, { status: 500 });
  }
}
