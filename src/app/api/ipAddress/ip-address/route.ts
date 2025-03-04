import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const DB_NAME = process.env.DB_NAME || "my-next-app";

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const collection = db.collection("settings");

        const ipData = await collection.findOne({}, { projection: { ip: 1, remember: 1, _id: 0 } });

        return NextResponse.json(
            { ip: ipData?.ip || "", remember: ipData?.remember || false },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching IP:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { ip, remember } = await req.json();

        if (!ip) {
            return NextResponse.json({ error: "IP address is required" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const collection = db.collection("settings");

        // Save both `ip` and `remember` status
        await collection.updateOne({}, { $set: { ip, remember } }, { upsert: true });

        return NextResponse.json({ message: "IP saved successfully!" }, { status: 200 });
    } catch (error) {
        console.error("Error saving IP:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
