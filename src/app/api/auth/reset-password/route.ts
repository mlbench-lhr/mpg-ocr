import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { message: "Email and password are required" },
                { status: 400 }
            );
        }

        if (password.trim() === "") {
            return NextResponse.json(
                { message: "Password cannot be empty or contain only spaces" },
                { status: 400 }
            );
        }

        const db = client.db("my-next-app");

        const user = await db.collection("users").findOne({ email });
        if (!user) {
            return NextResponse.json(
                { message: "User does not exist" },
                { status: 404 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.collection("users").updateOne(
            { email },
            { $set: { password: hashedPassword, updatedAt: new Date() } }
        );

        return NextResponse.json(
            { message: "Password reset successfully" },
            { status: 200 }
        );
    } catch {
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
