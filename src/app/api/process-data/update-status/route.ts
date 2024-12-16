import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function PATCH(req: Request) {
  try {
    const { id, field, value, reviewedBy } = await req.json();

    console.log(reviewedBy);


    if (!id || !field || value === undefined || !reviewedBy) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("my-next-app");
    const dataCollection = db.collection("mockData");

    const result = await dataCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          [field]: value,
          "reviewedBy": reviewedBy
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Field updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      { error: "Failed to update the field" },
      { status: 500 }
    );
  }
}
