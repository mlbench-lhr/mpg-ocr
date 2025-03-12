// import { NextRequest, NextResponse } from "next/server";
// import formidable from "formidable";
// import fs from "fs";
// import path from "path";
// import { IncomingMessage } from "http";
// import { Readable } from "stream";

// // Disable body parsing for file uploads
// export const config = {
//     api: {
//         bodyParser: false,
//     },
// };

// // Convert NextRequest to IncomingMessage
// async function convertRequest(req: NextRequest): Promise<IncomingMessage> {
//     if (!req.body) {
//         throw new Error("Request body is empty");
//     }

//     const reader = req.body.getReader();
//     const readable = new Readable();
//     readable._read = () => { }; // No-op

//     async function read() {
//         const { done, value } = await reader.read();
//         if (done) {
//             readable.push(null);
//         } else {
//             readable.push(value);
//             await read();
//         }
//     }

//     await read();

//     return Object.assign(readable, {
//         headers: Object.fromEntries(req.headers),
//         method: req.method,
//         url: req.url,
//     }) as IncomingMessage;
// }

// export async function POST(req: NextRequest) {
//     try {
//         const convertedReq = await convertRequest(req);
//         const form = formidable({ multiples: true });

// return new Promise((resolve) => {
//   form.parse(convertedReq, async (err, fields, files) => {
//     if (err) {
//       return resolve(NextResponse.json({ message: "Error parsing file" }, { status: 500 }));
//     }

//     const uploadedFiles = Array.isArray(files.pdf_file)
//       ? files.pdf_file
//       : files.pdf_file
//       ? [files.pdf_file]
//       : [];

//     if (uploadedFiles.length === 0) {
//       return resolve(NextResponse.json({ message: "No files uploaded" }, { status: 400 }));
//     }

//     const saveDirectory = path.join(process.cwd(), "public/file");
//     if (!fs.existsSync(saveDirectory)) {
//       fs.mkdirSync(saveDirectory, { recursive: true });
//     }

//     try {
//       for (const file of uploadedFiles) {
//         if (!file || !file.filepath || !file.originalFilename) continue;
//         const filePath = path.join(saveDirectory, file.originalFilename);
//         fs.renameSync(file.filepath, filePath);
//       }
//       return resolve(NextResponse.json({ message: "Files uploaded successfully" }, { status: 200 }));
//     } catch (error) {
//       return resolve(NextResponse.json({ message: "Error saving files" }, { status: 500 }));
//     }
//   });
// });

//         return new Promise((resolve) => {
//             form.parse(convertedReq, async (err, fields, files) => {
//                 if (err) {
//                     return resolve(NextResponse.json({ message: "Error parsing file" }, { status: 500 }));
//                 }

//                 const uploadedFiles = Array.isArray(files.pdf_file)
//                     ? files.pdf_file
//                     : files.pdf_file
//                         ? [files.pdf_file]
//                         : [];

//                 if (uploadedFiles.length === 0) {
//                     return resolve(NextResponse.json({ message: "No files uploaded" }, { status: 400 }));
//                 }

//                 const saveDirectory = path.join(process.cwd(), "public/file");
//                 await fs.promises.mkdir(saveDirectory, { recursive: true });

//                 try {
//                     for (const file of uploadedFiles) {
//                         if (!file || !file.filepath || !file.originalFilename) continue;

//                         // Validate file type
//                         if (file.mimetype !== "application/pdf") {
//                             return resolve(NextResponse.json({ message: "Only PDF files are allowed" }, { status: 400 }));
//                         }

//                         // Prevent overwriting
//                         const fileExtension = path.extname(file.originalFilename);
//                         const baseName = path.basename(file.originalFilename, fileExtension);
//                         const uniqueFilename = `${baseName}-${Date.now()}${fileExtension}`;
//                         const filePath = path.join(saveDirectory, uniqueFilename);

//                         await fs.promises.rename(file.filepath, filePath);
//                     }

//                     return resolve(NextResponse.json({ message: "Files uploaded successfully" }, { status: 200 }));
//                 } catch (error) {
//                     return resolve(NextResponse.json({ message: "Error saving files" }, { status: 500 }));
//                 }
//             });
//         });

//     } catch (error) {
//         return NextResponse.json(
//             { message: (error as Error).message || "Internal server error" },
//             { status: 500 }
//         );
//     }
// }
import { NextRequest, NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { IncomingMessage } from "http";
import clientPromise from "@/lib/mongodb";

const DB_NAME = process.env.DB_NAME || "my-next-app";


export const config = {
    api: {
        bodyParser: false,
    },
};

async function convertRequest(req: NextRequest): Promise<IncomingMessage> {
    const body = await req.arrayBuffer();
    const readable = Readable.from(Buffer.from(body)) as IncomingMessage;

    readable.headers = Object.fromEntries(req.headers);
    readable.method = req.method || "POST";
    return readable;
}

export async function POST(req: NextRequest) {
    try {

        const client = await clientPromise;
        const db = client.db(DB_NAME);

        const convertedReq = await convertRequest(req);
        const form = formidable({ multiples: true });

        const { files } = await new Promise<{ files: formidable.Files }>((resolve, reject) => {
            form.parse(convertedReq, (err, _, files) => {
                if (err) reject(err);
                else resolve({ files });
            });
        });

        const uploadedFiles = Array.isArray(files.pdf_file)
            ? files.pdf_file
            : files.pdf_file
                ? [files.pdf_file]
                : [];

        if (uploadedFiles.length === 0) {
            return NextResponse.json({ message: "No files uploaded" }, { status: 400 });
        }

        const saveDirectory = path.join(process.cwd(), "public/file");
        await fs.mkdir(saveDirectory, { recursive: true });

        // const uploadedResults: any[] = [];
        const uploadedResults: Record<string, unknown>[] = [];
        const fileDataArray = [];


        for (const file of uploadedFiles) {
            if (!file || !file.filepath || !file.originalFilename) continue;

            if (file.mimetype !== "application/pdf") {
                return NextResponse.json({ message: "Only PDF files are allowed" }, { status: 400 });
            }

            const uniqueFilename = `${Date.now()}-${file.originalFilename}`;
            const filePath = path.join(saveDirectory, uniqueFilename);

            await fs.rename(file.filepath, filePath);

            // await fs.copyFile(file.filepath, filePath);
            // await fs.unlink(file.filepath);

            uploadedResults.push({ filename: file.originalFilename, status: "uploaded" });

            const fileUrl = `/file/${uniqueFilename}`;

            const fileData = {
                jobId: "",
                pdfUrl: fileUrl,
                deliveryDate: "",
                noOfPages: 0,
                blNumber: "",
                podDate: "",
                podSignature: "",
                totalQty: "",
                received: "",
                damaged: "",
                short: "",
                over: "",
                refused: "",
                customerOrderNum: "",
                stampExists: "",
                finalStatus: "new",
                reviewStatus: "unConfirmed",
                recognitionStatus: "new",
                breakdownReason: "none",
                reviewedBy: "",
                cargoDescription: "",
            };

            fileDataArray.push(fileData);

        }


        const bulkOps = [];


        for (const data of fileDataArray) {
            bulkOps.push({
                insertOne: { document: { ...data, createdAt: new Date() } }
            });
        }

        if (bulkOps.length > 0) {
            const result = await db.collection("mockData").bulkWrite(bulkOps);
            return NextResponse.json({
                message: "Files uploaded and saved successfully",
                modifiedCount: result.modifiedCount,
                insertedCount: result.insertedCount,
            });
        } else {
            return NextResponse.json({ message: "No valid data to process" }, { status: 400 });
        }

        // return NextResponse.json({
        //     message: "Files uploaded successfully",
        //     files: uploadedResults,
        // });
    } catch (error: unknown) {
        console.error("File upload error:", error);
    
        let errorMessage = "An unknown error occurred";
        
        if (error instanceof Error) {
            errorMessage = error.message;
        }
    
        return NextResponse.json({ message: "Error saving files", error: errorMessage }, { status: 500 });
    }
    
}
