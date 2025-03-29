import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// Handle GET request - Fetch existing WMS URL
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("my-next-app");
    const collection = db.collection("wms_urls");

    const existing = await collection.findOne({}, { projection: { _id: 0, wmsUrl: 1 } });

    return NextResponse.json(existing || { wmsUrl: "" });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
}

}

// Handle POST request - Save/Update WMS URL
export async function POST(req: Request) {
  try {
    const { wmsUrl } = await req.json();

    if (!wmsUrl) {
      return NextResponse.json({ error: "WMS URL is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("my-next-app");
    const collection = db.collection("wms_urls");

    await collection.updateOne({}, { $set: { wmsUrl } }, { upsert: true });

    return NextResponse.json({ message: "WMS URL saved successfully" });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
}
}
