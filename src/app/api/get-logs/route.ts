import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Filter } from 'mongodb';


const DB_NAME = process.env.DB_NAME || 'my-next-app';
type Log = {
  fileName?: string;
  status?: string;
  // add other fields in your logs document if needed
};


export async function GET(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const logsCollection = db.collection('logs');

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const searchQuery = url.searchParams.get("search") || "";

    let filter: Filter<Log> = {};

    if (searchQuery) {
      const regex = { $regex: searchQuery, $options: "i" };
      filter = {
        $or: [
          { fileName: regex },
          { status: regex }
        ]
      };
    }

    const logs = await logsCollection
      .find(filter)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const totalLogs = await logsCollection.countDocuments(filter);

    return NextResponse.json(
      { logs, totalLogs, page, totalPages: Math.ceil(totalLogs / limit) },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs.' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({ allowedMethods: ['GET'] });
}
