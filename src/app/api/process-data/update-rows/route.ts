import { NextResponse } from "next/server";
import { getOracleConnection } from "@/lib/oracle";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import oracledb from "oracledb";

interface FileRow {
    FILE_ID: string;
    FILE_NAME: string;
    FILE_DATA: oracledb.Lob | null;
}

export async function PUT(req: Request) {
    try {
        const { ids } = await req.json();

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: "No valid IDs provided for update" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("my-next-app");
        const connectionsCollection = db.collection("db_connections");
        const jobCollection = db.collection("mockData");

        const userDBCredentials = await connectionsCollection.findOne({}, { sort: { _id: -1 } });
        if (!userDBCredentials) {
            return NextResponse.json({ message: "OracleDB credentials not found" }, { status: 404 });
        }

        const { userName, password, ipAddress, portNumber, serviceName } = userDBCredentials;
        const connection = await getOracleConnection(userName, password, ipAddress, portNumber, serviceName);

        const objectIds = ids.map((id) => new ObjectId(id));

        const jobsToUpdate = await jobCollection.find({ _id: { $in: objectIds } }).toArray();

        for (const job of jobsToUpdate) {

            let { fileId } = job;
            const { pdfUrl, blNumber, podDate, podSignature, totalQty, received, damaged, short, over, refused, sealIntact } = job;

            const file_name = pdfUrl.split("/").pop() || "";
            const currentYear = new Date().getFullYear();
            const fileTable = `XTI_${currentYear}_T`;

            if (!fileId) {

                const result = await connection.execute<FileRow>(
                    `SELECT FILE_ID FROM ${fileTable} WHERE FILE_NAME = :file_name`,
                    { file_name },
                    { outFormat: oracledb.OUT_FORMAT_OBJECT }
                );

                const row = result.rows?.[0] as FileRow | undefined;
                fileId = row?.FILE_ID
            }


            let podDateValue = null;
            if (podDate) {
                const columnTypeQuery = await connection.execute(
                    `SELECT DATA_TYPE 
                     FROM ALL_TAB_COLUMNS 
                     WHERE OWNER = 'JDATM_PROD' AND TABLE_NAME = 'XTI_FILE_POD_OCR_T' AND COLUMN_NAME = 'OCR_STMP_POD_DTT'`,
                    [],
                    { outFormat: oracledb.OUT_FORMAT_OBJECT }
                );

                const rows = columnTypeQuery.rows as Array<{ DATA_TYPE: string }> | undefined;
                const columnType = rows && rows.length > 0 ? rows[0].DATA_TYPE : null;
                if (columnType === "DATE") {
                    podDateValue = new Date(podDate);
                } else if (columnType?.includes("CHAR")) {
                    podDateValue = podDate;
                }
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
                    bolNo: blNumber,
                    issQty: totalQty,
                    rcvQty: received,
                    podDate: podDateValue,
                    sign: podSignature,
                    symtNone: "N",
                    symtDamg: damaged,
                    symtShrt: short,
                    symtOrvg: over,
                    symtRefs: refused,
                    symtSeal: sealIntact,
                    fileId: fileId,
                }
            );
        }

        await connection.commit();
        await connection.close();

        return NextResponse.json({ message: "OCR data updated successfully in OracleDB" });
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error("Error updating OCR data:", err);
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
    }
}
