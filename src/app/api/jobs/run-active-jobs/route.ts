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
    bill_of_lading?: {
        bill_no: string;
    };
    carrier?: {
        carrier_name: string;
    };
    stamp?: {
        pod_date: string;
        pod_sign: string;
        ctns_delivered: number;
        ctns_damaged: number;
        ctns_short: number;
        ctns_over: number;
        refused: string;
        seal_intact: string;
        damaged: string;
    };
    signatures?: {
        receiver_signature: string;
    };
    customer_order_info?: {
        total_order_quantity: number;
    };
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
                                    const ocrData = await fetchOCRData(pdfUrl);
                                    const processedDataArray = ocrData.map((data: OCRData) => ({
                                        blNumber: data.bill_of_lading?.bill_no || "Unknown",
                                        jobId: job._id ? job._id.toString() : null,
                                        jobName: job.jobName,
                                        pdfUrl: pdfUrl,
                                        carrier: data.carrier?.carrier_name || "Unknown Carrier",
                                        podDate: data.stamp?.pod_date || null,
                                        deliveryDate: new Date(),
                                        podSignature: data.stamp?.pod_sign || "none",
                                        receiverSignature: data.signatures?.receiver_signature || "none",
                                        totalQty: data.customer_order_info?.total_order_quantity || 0,
                                        noOfPages: 1,
                                        delivered: data.stamp?.ctns_delivered || 0,
                                        damaged: data.stamp?.ctns_damaged || 0,
                                        short: data.stamp?.ctns_short || 0,
                                        over: data.stamp?.ctns_over || 0,
                                        refused: data.stamp?.refused === "yes" ? 1 : 0,
                                        sealIntact: data.stamp?.seal_intact === "yes" ? "Y" : "N",
                                        finalStatus: "new",
                                        reviewStatus: "unConfirmed",
                                        recognitionStatus: "new",
                                        breakdownReason: data.stamp?.damaged === "yes" ? "damaged" : "none",
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
