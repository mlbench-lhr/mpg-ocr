// import { NextRequest, NextResponse } from "next/server";
// import oracledb from "oracledb";

// export async function POST(req: NextRequest) {
//     let connection;
//     try {
//         const formData = await req.formData();
//         const file = formData.get("file") as Blob | null;
//         const fileId = formData.get("fileId") as string;

//         if (!file || !fileId) {
//             return NextResponse.json({ message: "Missing file or fileId" }, { status: 400 });
//         }

//         const arrayBuffer = await file.arrayBuffer();
//         const pdfBuffer = Buffer.from(arrayBuffer);

//         connection = await oracledb.getConnection({
//             user: "numan",
//             password: "numan786$",
//             connectString: "192.168.18.126:1539/ORCLCDB",
//         });

//         let result;

//         const check = await connection.execute<{ FILE_DATA: oracledb.Lob }>(
//             `SELECT FILE_DATA FROM XTI_2024_T WHERE FILE_ID = :id FOR UPDATE`,
//             { id: fileId }
//         );

//         if (check.rows && check.rows.length > 0) {

//             result = await connection.execute(
//                 `UPDATE XTI_2024_T 
//                  SET FILE_DATA = EMPTY_BLOB() 
//                  WHERE FILE_ID = :id 
//                  RETURNING FILE_DATA INTO :blob`,
//                 {
//                     id: fileId,
//                     blob: { dir: oracledb.BIND_OUT, type: oracledb.BLOB }
//                 },
//                 { autoCommit: false }
//             );
//         } else {
//             result = await connection.execute(
//                 `INSERT INTO XTI_2024_T (FILE_ID, FILE_DATA) 
//                  VALUES (:id, EMPTY_BLOB()) 
//                  RETURNING FILE_DATA INTO :blob`,
//                 {
//                     id: fileId,
//                     blob: { dir: oracledb.BIND_OUT, type: oracledb.BLOB }
//                 },
//                 { autoCommit: false }
//             );
//         }


//         const outBinds = result.outBinds as { blob?: oracledb.Lob[] };

//         if (!outBinds.blob || !outBinds.blob[0]) {
//             throw new Error("LOB locator is missing.");
//         }

//         const lob = outBinds.blob[0];

//         await new Promise<void>((resolve, reject) => {
//             lob.write(pdfBuffer, (err) => {
//                 if (err) reject(new Error("Failed to write to LOB: " + err.message));
//                 lob.end();
//                 resolve();
//             });
//         });

//         await connection.commit();

//         return NextResponse.json({ message: "PDF uploaded successfully", fileId });

//     } catch (err: unknown) {
//         const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
//         console.error("Error inserting PDF:", errorMessage);
//         return NextResponse.json({ error: errorMessage }, { status: 500 });
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (err) {
//                 console.error("Error closing connection:", err);
//             }
//         }
//     }
// }
import { NextRequest, NextResponse } from "next/server";
import oracledb from "oracledb";

export async function POST(req: NextRequest) {
    let connection;
    try {
        const formData = await req.formData();
        const file = formData.get("file") as Blob | null;
        const fileId = formData.get("fileId") as string;
        const fileName = formData.get("fileName") as string;

        if (!file || !fileId || !fileName) {
            return NextResponse.json({ message: "Missing file, fileId, or fileName" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdfBuffer = Buffer.from(arrayBuffer);

        connection = await oracledb.getConnection({
            user: "numan",
            password: "numan786$",
            connectString: "192.168.18.126:1539/ORCLCDB",
        });

        const check = await connection.execute<{ FILE_DATA: oracledb.Lob }>(
            `SELECT FILE_DATA FROM XTI_2024_T WHERE FILE_ID = :id FOR UPDATE`,
            { id: fileId }
        );

        let result;
        if (check.rows && check.rows.length > 0) {
            result = await connection.execute(
                `UPDATE XTI_2024_T 
                 SET FILE_DATA = EMPTY_BLOB(), FILE_NAME = :fileName 
                 WHERE FILE_ID = :id 
                 RETURNING FILE_DATA INTO :blob`,
                {
                    id: fileId,
                    fileName,
                    blob: { dir: oracledb.BIND_OUT, type: oracledb.BLOB }
                },
                { autoCommit: false }
            );
        } else {
            result = await connection.execute(
                `INSERT INTO XTI_2024_T (FILE_ID, FILE_DATA, FILE_NAME) 
                 VALUES (:id, EMPTY_BLOB(), :fileName) 
                 RETURNING FILE_DATA INTO :blob`,
                {
                    id: fileId,
                    fileName,
                    blob: { dir: oracledb.BIND_OUT, type: oracledb.BLOB }
                },
                { autoCommit: false }
            );
        }

        const outBinds = result.outBinds as { blob?: oracledb.Lob[] };
        if (!outBinds.blob || !outBinds.blob[0]) {
            throw new Error("LOB locator is missing.");
        }

        const lob = outBinds.blob[0];
        await new Promise<void>((resolve, reject) => {
            lob.write(pdfBuffer, (err) => {
                if (err) reject(new Error("Failed to write to LOB: " + err.message));
                lob.end();
                resolve();
            });
        });

        await connection.commit();

        return NextResponse.json({ message: "PDF uploaded successfully", fileId });

    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        console.error("Error inserting PDF:", errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }
}
