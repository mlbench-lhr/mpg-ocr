import { NextResponse } from "next/server";

export async function POST() {
    try {
        // Invalidate the session on the client side by returning a success message
        return NextResponse.json({ message: "Logout successful" }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
