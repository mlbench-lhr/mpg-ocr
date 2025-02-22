import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

const documentId = new ObjectId("65d123456789abcd12345678"); // Replace with a valid ObjectId

// **GET Request: Fetch OCR Status**
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("my-next-app"); // Replace with your DB name
    const collection = db.collection("ocr_status");

    const ocrStatus = await collection.findOne({ _id: documentId });

    return NextResponse.json(
      { status: ocrStatus?.status || "stop" }, // Default to 'stop' if not found
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching OCR status:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// **POST Request: Update OCR Status**
export async function POST(req: Request) {
  try {
    const { status } = await req.json();

    if (!status || (status !== "start" && status !== "stop")) {
      return NextResponse.json(
        { message: "Invalid status. Use 'start' or 'stop'." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("my-next-app");
    const collection = db.collection("ocr_status");

    await collection.updateOne(
      { _id: documentId },
      { $set: { status, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json(
      { message: `OCR ${status}ed successfully` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating OCR status:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
