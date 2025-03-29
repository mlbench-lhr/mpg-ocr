import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getOracleConnection } from "@/lib/oracle";

export async function POST(req: Request) {
    try {
        const { fileId } = await req.json();

        if (!fileId) {
            return NextResponse.json({ error: "fileId is required" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("my-next-app");
        const connectionsCollection = db.collection("db_connections");

        const userDBCredentials = await connectionsCollection.findOne({}, { sort: { _id: -1 } });

        if (!userDBCredentials) {
            return NextResponse.json({ message: "OracleDB credentials not found" }, { status: 404 });
        }

        const { userName, password, ipAddress, portNumber, serviceName } = userDBCredentials;
        const connection = await getOracleConnection(userName, password, ipAddress, portNumber, serviceName);

        await connection.execute(
            `INSERT INTO XTI_FILE_POD_OCR_T (FILE_ID, CRTD_USR_CD, CRTD_DTT, SENT_FILE_DTT)
       VALUES (:fileId, 'OCR', SYSDATE, SYSDATE)`,
            [fileId]
        );

        await connection.commit();
        await connection.close();

        return NextResponse.json({ message: "Read history stored successfully" });
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error("Error storing read history:", err);
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
    }
}
