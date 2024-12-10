// /api/process-data/fetch-pdf/route.ts

import { NextResponse } from 'next/server';

// Define a type for the PDF structure
type PDF = {
  name: string;
  url: string;
};

export async function GET() {
  try {
    // Fetch the list of PDFs from the provided URL
    const response = await fetch('https://hanneskonzept.ml-bench.com/public/api/pdf-files');

    // Check if the response is successful
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch PDF data' }, { status: 500 });
    }

    // Log the raw response to inspect its contents
    const rawData = await response.text(); // Read the response as plain text to inspect it
    // console.log("Raw Response Data:", rawData); 

    // Parse the JSON response
    const data = JSON.parse(rawData);

    // Extract the pdf_files array
    const pdfs: PDF[] = data?.pdf_files || [];

    // Filter out any empty objects from the pdf_files array
    const validPdfs = pdfs.filter((pdf) => pdf.name && pdf.url);

    // If there are no valid PDFs, return an error
    if (validPdfs.length === 0) {
      return NextResponse.json({ error: 'No valid PDFs found' }, { status: 404 });
    }

    // Fetch the first valid PDF
    const pdf = validPdfs[0];

    // Log the PDF data to inspect the structure
    // console.log("Fetched PDF Data:", pdf);

    // Extract necessary fields: name and url
    const responseData = {
      name: pdf.name,  // PDF name
      url: pdf.url,    // PDF URL
    };

    // Return the fetched PDF as a JSON response
    return NextResponse.json(responseData, { status: 200 });

  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
