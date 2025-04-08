import { NextRequest, NextResponse } from "next/server";
import { getOracleConnection } from "@/lib/oracle";
import clientPromise from "@/lib/mongodb";
import oracledb from "oracledb";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(req: NextRequest) {
    let connection;
    try {
        const client = await clientPromise;
        const db = client.db("my-next-app");
        const connectionsCollection = db.collection("db_connections");

        const userDBCredentials = await connectionsCollection.findOne({}, { sort: { _id: -1 } });


        if (!userDBCredentials) {
            return NextResponse.json({ message: "OracleDB credentials not found" }, { status: 404 });
        }

        console.log(userDBCredentials);

        const { userName, password, ipAddress, portNumber, serviceName } = userDBCredentials;
        connection = await getOracleConnection(userName, password, ipAddress, portNumber, serviceName);

        //     const result = await connection.execute(
        //         `
        // SELECT B.FILE_ID AS "fileId",
        //        B.FILE_TABLE AS "fileTable", 
        //        C.CRTD_USR_CD AS "crtdUsrCd"
        // FROM LD_LEG_T A,
        //      XTI_FILE_POD_T B,
        //      XTI_FILE_POD_OCR_T C
        // WHERE A.LD_LEG_ID = B.LD_LEG_ID
        //   AND A.DIV_CD IN ('ADC', 'SDS1', 'SMX3') 
        //   AND B.FILE_ID = C.FILE_ID(+)
        //   AND C.CRTD_USR_CD IS NULL          
        //   AND B.FILE_ID LIKE 'POD%'  
        //   AND B.CRTD_DTT >= TRUNC(SYSDATE - 15) 
        //   AND B.CRTD_DTT < TRUNC(SYSDATE)
        //   AND NOT EXISTS (
        //       SELECT 1 FROM XTI_FILE_POD_OCR_T X WHERE X.FILE_ID = B.FILE_ID
        //   )
        //   FETCH FIRST 1 ROW ONLY
        // `,
        //         [],
        //         { outFormat: oracledb.OUT_FORMAT_OBJECT }
        //     );
        
        const result = await connection.execute(
               `SELECT A.FILE_ID, A.FILE_TABLE
                FROM JDATM_PROD.XTI_FILE_POD_T A,
                    JDATM_PROD.XTI_POD_STAMP_REQRD_T B
                WHERE A.FILE_ID = B.FILE_ID
                AND B.BOL_OCR_CAT = 'S'
                AND TO_CHAR(B.CRTD_DTT, 'YYYYMMDD') = TO_CHAR(SYSDATE - 1, 'YYYYMMDD')
                FETCH FIRST 1 ROW ONLY
                `,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );


    //     const result = await connection.execute(
    //         `
    // SELECT B.FILE_ID AS "fileId",
    //        B.FILE_TABLE AS "fileTable", 
    //        C.CRTD_USR_CD AS "crtdUsrCd"
    // FROM LD_LEG_T A,
    //      XTI_FILE_POD_T B,
    //      XTI_FILE_POD_OCR_T C
    // WHERE A.LD_LEG_ID = B.LD_LEG_ID
    //   AND A.DIV_CD IN ('ADC', 'SDS1', 'SMX3') 
    //   AND B.FILE_ID = C.FILE_ID(+)
    //   AND C.CRTD_USR_CD IS NULL          
    //   AND B.FILE_ID LIKE 'POD%'  
    //   AND B.CRTD_DTT = SYSDATE - 1
    //   AND NOT EXISTS (
    //       SELECT 1 FROM XTI_FILE_POD_OCR_T X WHERE X.FILE_ID = B.FILE_ID
    //   )
    //   FETCH FIRST 1 ROW ONLY
    // `,
    //         [],
    //         { outFormat: oracledb.OUT_FORMAT_OBJECT }
    //     );

        const formattedResult = result.rows ?? [];

        return NextResponse.json(formattedResult);
    } catch (err) {
        console.error("Error retrieving data from OracleDB:", err);
        return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
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


// const result = await connection.execute(`
// SELECT B.FILE_ID, B.FILE_TABLE, B.CRTD_DTT 
// FROM LD_LEG_T A
// JOIN XTI_FILE_POD_T B ON A.LD_LEG_ID = B.LD_LEG_ID
// WHERE A.DIV_CD IN ('ADC', 'SDS1', 'SMX3')
// `);

// const result = await connection.execute(`
// SELECT FILE_ID, FILE_TABLE, CRTD_DTT 
// FROM XTI_FILE_POD_T
// WHERE CRTD_DTT = SYSDATE - 1
// `);