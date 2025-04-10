import { NextResponse } from "next/server";
import { getOracleConnection } from "@/lib/oracle";
import clientPromise from "@/lib/mongodb";
import oracledb from "oracledb";

export async function PUT(req: Request) {
    try {
        const { fileId, ocrData } = await req.json();

        if (!fileId || !ocrData) {
            return NextResponse.json({ error: "fileId and ocrData are required" }, { status: 400 });
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

        const columnTypeQuery = await connection.execute(
            `SELECT DATA_TYPE 
             FROM ALL_TAB_COLUMNS 
             WHERE OWNER = 'JDATM_PROD' AND TABLE_NAME = 'XTI_FILE_POD_OCR_T' AND COLUMN_NAME = 'OCR_STMP_POD_DTT'`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );


        const rows = columnTypeQuery.rows as Array<{ DATA_TYPE: string }> | undefined;
        const columnType = rows && rows.length > 0 ? rows[0].DATA_TYPE : null;

        // console.log("Column Type for OCR_STMP_POD_DTT:", columnType);

        let podDateValue = null;
        if (ocrData.podDate && columnType === "DATE") {
            podDateValue = new Date(ocrData.podDate);
        } else if (ocrData.podDate && columnType?.includes("CHAR")) {
            podDateValue = ocrData.podDate;
        }

        await connection.execute(
            `UPDATE JDATM_PROD.XTI_FILE_POD_OCR_T
            SET OCR_BOLNO = :bolNo, 
                OCR_ISSQTY = :issQty, 
                OCR_RCVQTY = :rcvQty,
                OCR_STMP_POD_DTT = :podDate, 
                OCR_STMP_SIGN = :sign, 
                OCR_SYMT_NONE = :symtNone, 
                OCR_SYMT_DAMG = :symtDamg, 
                OCR_SYMT_SHRT = :symtShrt, 
                OCR_SYMT_ORVG = :symtOrvg, 
                OCR_SYMT_REFS = :symtRefs, 
                OCR_SYMT_SEAL = :symtSeal,
                RECV_DATA_DTT = SYSDATE,
                UPTD_USR_CD = 'OCR',
                UPTD_DTT = SYSDATE
            WHERE FILE_ID = :fileId`,
            {
                bolNo: ocrData.blNumber,
                issQty: ocrData.totalQty,
                rcvQty: ocrData.received,
                podDate: podDateValue,
                sign: ocrData.podSignature,
                symtNone: ocrData.none,
                symtDamg: ocrData.damaged,
                symtShrt: ocrData.short,
                symtOrvg: ocrData.over,
                symtRefs: ocrData.refused,
                symtSeal: ocrData.sealIntact,
                fileId: fileId,
            }
        );

        await connection.commit();
        await connection.close();

        return NextResponse.json({ message: "OCR data updated successfully" });
    }
    catch (err: unknown) {
        if (err instanceof Error) {
            console.error("Error updating OCR data:", err);
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
    }
}
