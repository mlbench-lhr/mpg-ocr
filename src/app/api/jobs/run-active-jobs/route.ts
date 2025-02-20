import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { fetchPdfUrls } from "@/lib/fetchPdf";
import { fetchOCRData } from "@/lib/fetchOCRData";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isBetween from "dayjs/plugin/isBetween";
import { saveProcessedDataToDB } from "@/lib/saveProcessedDataToDB";

dayjs.extend(utc);
dayjs.extend(isBetween);


interface OCRData {
    B_L_Number: number | null;
    Stamp_Exists: string;
    POD_Date: string | null;
    Signature_Exists: string;
    Issued_Qty:  number | null | string;
    Received_Qty:  number | null | string;
    Damage_Qty:  number | null | string;
    Short_Qty:  number | null | string;
    Over_Qty:  number | null | string;
    Refused_Qty:  number | null | string;
    Customer_Order_Num: string | string[] | null;
}


export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db("my-next-app");

        const jobsCollection = db.collection("jobs");

        const activeJobs = await jobsCollection.find({ active: true }).toArray();
        const currentTime = dayjs().add(5, "hours");

        for (const job of activeJobs) {


            const selectedDays = job.selectedDays;
            const currentDay = currentTime.format("dddd");

            if (selectedDays.includes(currentDay)) {


                const { fromTime, toTime } = job.pdfCriteria;
                const from = dayjs(fromTime).utc();
                const to = dayjs(toTime).utc();
                if (currentTime.isBetween(from, to)) {
                    const intervalMinutes = parseInt(job.everyTime);
                    const minuteDifference = currentTime.diff(from, 'minute');
                    if (minuteDifference % intervalMinutes === 0) {
                        const pdfUrls = await fetchPdfUrls();
                        if (pdfUrls.length > 0) {
                            for (const pdfUrl of pdfUrls) {
                                try {
                                    // const ocrData = await fetchOCRData(pdfUrl);
                                    // const processedDataArray = ocrData.map((data: OCRData) => ({
                                    //     blNumber: data.bill_of_lading?.bill_no || "Unknown",
                                    //     jobId: job._id ? job._id.toString() : null,
                                    //     jobName: job.jobName,
                                    //     pdfUrl: pdfUrl,
                                    //     carrier: data.carrier?.carrier_name || "Unknown Carrier",
                                    //     podDate: data.stamp?.pod_date,
                                    //     deliveryDate: new Date(),
                                    //     podSignature: data.stamp?.pod_sign,
                                    //     receiverSignature: data.signatures?.receiver_signature,
                                    //     totalQty: data.customer_order_info?.total_order_quantity,
                                    //     noOfPages: 1,
                                    //     delivered: data.stamp?.ctns_delivered,
                                    //     damaged: data.stamp?.ctns_damaged,
                                    //     short: data.stamp?.ctns_short,
                                    //     over: data.stamp?.ctns_over,
                                    //     refused: data.stamp?.refused,
                                    //     sealIntact: data.stamp?.seal_intact === "yes" ? "Y" : "N",
                                    //     finalStatus: "new",
                                    //     reviewStatus: "unConfirmed",
                                    //     recognitionStatus: "new",
                                    //     breakdownReason: data.stamp?.damaged === "yes" ? "damaged" : "none",
                                    //     reviewedBy: "OCR Engine",
                                    //     cargoDescription: "Processed from OCR API.",
                                    // }));
                                    // await saveProcessedDataToDB(processedDataArray);
                                    // console.log('Processed and saved OCR data for PDF URL:', pdfUrl);

                                    const ocrData = await fetchOCRData(pdfUrl);
                                    const processedDataArray = ocrData.map((data: OCRData) => ({
                                        jobId: job._id ? job._id.toString() : null,
                                        pdfUrl: pdfUrl,
                                        deliveryDate: new Date(),
                                        noOfPages: 1,


                                        blNumber: data.B_L_Number || null,
                                        jobName: job.jobName,

                                        podDate: data.POD_Date,
                                        podSignature: data.Signature_Exists === "yes" ? "Yes" : data.Signature_Exists === "no" ? "No" : data.Signature_Exists,
                                        totalQty: data.Issued_Qty,

                                        received: data.Received_Qty,
                                        damaged: data.Damage_Qty,
                                        short: data.Short_Qty,
                                        over: data.Over_Qty,
                                        refused: data.Refused_Qty,

                                        customerOrderNum: data.Customer_Order_Num || null,

                                        stampExists: data.Stamp_Exists === "yes" ? "Y" : data.Stamp_Exists === "no" ? "N" : data.Stamp_Exists,

                                        finalStatus: "new",
                                        reviewStatus: "unConfirmed",
                                        recognitionStatus: "new",
                                        breakdownReason: "none",
                                        reviewedBy: "OCR Engine",
                                        cargoDescription: "Processed from OCR API.",
                                    }));

                                    await saveProcessedDataToDB(processedDataArray);
                                    console.log('Processed and saved OCR data for PDF URL:', pdfUrl);

                                } catch (error) {
                                    console.error('Error processing OCR data for PDF URL:', pdfUrl, error);
                                }
                            }
                        }
                    }
                }
            }
        }
        return NextResponse.json({ message: 'Jobs processed, PDFs fetched, and OCR data saved successfully.' }, { status: 200 });
    } catch (error) {
        console.log('Error processing jobs:', error);
        return NextResponse.json({ error: 'Failed to process jobs.' }, { status: 500 });
    }
}
