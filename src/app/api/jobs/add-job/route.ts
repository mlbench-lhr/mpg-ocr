import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

const DB_NAME = process.env.DB_NAME || "my-next-app";

// Connect to the database and get the collection
async function getJobsCollection() {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  return db.collection("jobs");
}

// Define the PDFCriteria type
interface PDFCriteria {
  fromTime: Date;
  toTime: Date;
}

// POST: Add Job
// export async function POST(req: Request) {
//   try {
//     const jobsCollection = await getJobsCollection();
//     const body = await req.json();
//     const { selectedDays, fromTime, toTime, everyTime } = body;

//     // Input validation
//     if (!selectedDays?.length || !fromTime || !toTime || !everyTime) {
//       return NextResponse.json({ error: "All fields are required." }, { status: 400 });
//     }

//     const result = await jobsCollection.insertOne({
//       selectedDays,
//       fromTime,
//       toTime,
//       everyTime,
//       active: false,
//       createdAt: new Date(),
//     });

//     return NextResponse.json({ message: "Job added successfully.", data: result }, { status: 201 });
//   } catch (error) {
//     console.error("Error adding job:", error);
//     return NextResponse.json({ error: "Failed to add job." }, { status: 500 });
//   }
// }

// API Route for creating a job and fetching PDFs
// export async function POST(req: Request) {
//   try {
//     const jobsCollection = await getJobsCollection();
//     const body = await req.json();
//     const { selectedDays, fromTime, toTime, everyTime } = body;

//     // Validate required fields
//     if (!selectedDays?.length || !fromTime || !toTime || !everyTime) {
//       return NextResponse.json({ error: "All fields are required." }, { status: 400 });
//     }

//     // Get the current date
//     const currentDate = new Date();

//     // Parse the time string (HH:MM) into a Date object using the current date in local timezone
//     const parseTime = (timeString: string): Date => {
//       const [hours, minutes] = timeString.split(':').map(Number);

//       // Create a new Date object based on the current date
//       const newDate = new Date(currentDate);
//       newDate.setHours(hours, minutes, 0, 0);  // Set the time to the provided hours and minutes

//       // Adjust for the local time zone offset
//       const timeZoneOffset = currentDate.getTimezoneOffset(); // Get time zone offset in minutes
//       newDate.setMinutes(newDate.getMinutes() - timeZoneOffset); // Apply the offset to avoid UTC conversion

//       return newDate;
//     };

//     // Convert fromTime and toTime to Date objects using the current date and correct time zone
//     const pdfCriteria: PDFCriteria = {
//       fromTime: parseTime(fromTime),
//       toTime: parseTime(toTime),
//     };

//     // Insert the job into MongoDB with dynamic date range
//     const result = await jobsCollection.insertOne({
//       selectedDays,
//       fromTime,
//       toTime,
//       everyTime,
//       pdfCriteria: pdfCriteria,
//       active: false,
//       createdAt: new Date(),
//     });

//     // Return success response
//     return NextResponse.json({ message: "Job added successfully.", data: result }, { status: 201 });
//   } catch (error) {
//     console.error("Error adding job:", error);
//     return NextResponse.json({ error: "Failed to add job." }, { status: 500 });
//   }
// }

export async function POST(req: Request) {
  try {
    const jobsCollection = await getJobsCollection();
    const body = await req.json();
    const { selectedDays, fromTime, toTime, everyTime } = body;

    // Validate required fields
    if (!selectedDays?.length || !fromTime || !toTime || !everyTime) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    // Get the current date
    const currentDate = new Date();

    // Parse the time string (HH:MM) into a Date object using the current date in local timezone
    const parseTime = (timeString: string): Date => {
      const [hours, minutes] = timeString.split(":").map(Number);

      // Create a new Date object based on the current date
      const newDate = new Date(currentDate);
      newDate.setHours(hours, minutes, 0, 0); // Set the time to the provided hours and minutes

      // Adjust for the local time zone offset
      const timeZoneOffset = currentDate.getTimezoneOffset(); // Get time zone offset in minutes
      newDate.setMinutes(newDate.getMinutes() - timeZoneOffset); // Apply the offset to avoid UTC conversion

      return newDate;
    };

    // Convert fromTime and toTime to Date objects using the current date and correct time zone
    const pdfCriteria: PDFCriteria = {
      fromTime: parseTime(fromTime),
      toTime: parseTime(toTime),
    };

    // Check the highest existing job number
    const latestJob = await jobsCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();

    let nextJobNumber = 1; // Default to 1 if no jobs exist
    if (latestJob.length > 0 && latestJob[0].jobName?.startsWith("Job #")) {
      const lastJobNumber = parseInt(latestJob[0].jobName.replace("Job #", ""), 10);
      nextJobNumber = isNaN(lastJobNumber) ? 1 : lastJobNumber + 1;
    }

    // Generate the next job name
    const jobName = `Job #${nextJobNumber}`;

    // Insert the job into MongoDB with dynamic date range and job name
    const result = await jobsCollection.insertOne({
      jobName,
      selectedDays,
      fromTime,
      toTime,
      everyTime,
      pdfCriteria: pdfCriteria,
      active: false,
      createdAt: new Date(),
    });

    // Return success response
    return NextResponse.json({ message: "Job added successfully.", data: result }, { status: 201 });
  } catch (error) {
    console.error("Error adding job:", error);
    return NextResponse.json({ error: "Failed to add job." }, { status: 500 });
  }
}


// Fetch PDFs matching the date range criteria
// const pdfFiles = await fetchPDFs(pdfCriteria);
// console.log(pdfFiles);

// Function to fetch PDFs based on date range
// async function fetchPDFs(pdfCriteria: PDFCriteria) {
//   const url = `https://hanneskonzept.ml-bench.com/api/pdf-files?fromTime=${pdfCriteria.fromTime.toISOString()}&toTime=${pdfCriteria.toTime.toISOString()}`;

//   const response = await fetch(url);
//   if (!response.ok) {
//     throw new Error("Failed to fetch PDFs.");
//   }

//   const data = await response.json();
//   return data.pdf_files;
// }


// GET: Fetch Jobs
export async function GET(req: Request) {
  try {
    const jobsCollection = await getJobsCollection();
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "3", 10);
    const skip = (page - 1) * limit;
    const searchQuery = url.searchParams.get("search")?.trim().toLowerCase() || "";

    let filter = {};

    // Define keywords for active and inactive
    const activeKeywords = ["ac", "active", "act", "acti", "activ"];
    const inactiveKeywords = ["in", "inactive", "inact", "ina", "inac", "inacti", "inactiv"];

    if (searchQuery) {
      // Check if the search query matches an exact keyword from the active array
      if (activeKeywords.some((keyword) => searchQuery === keyword)) {
        filter = { active: true };
      }
      // Check if the search query matches an exact keyword from the inactive array
      else if (inactiveKeywords.some((keyword) => searchQuery === keyword)) {
        filter = { active: false };
      }
      // Default to regex-based search for other cases
      // else {
      //   filter = { selectedDays: { $regex: searchQuery, $options: "i" } };
      // }
    }

    // Fetch jobs and total job count
    const [jobs, totalJobs] = await Promise.all([
      jobsCollection.find(filter).skip(skip).limit(limit).toArray(),
      jobsCollection.countDocuments(filter),
    ]);

    // Prepare the response
    return NextResponse.json(
      { jobs, totalJobs, page, totalPages: Math.ceil(totalJobs / limit) },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json({ error: "Failed to fetch jobs." }, { status: 500 });
  }
}


// PATCH: Update Job Status
export async function PATCH(req: Request) {
  try {
    const jobsCollection = await getJobsCollection();
    const { id, active } = await req.json();

    if (!id || typeof active !== "boolean") {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ObjectId format." }, { status: 400 });
    }

    const result = await jobsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { active } }
    );

    if (!result.matchedCount) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Job status updated successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error updating job status:", error);
    return NextResponse.json({ error: "Failed to update job status." }, { status: 500 });
  }
}

// OPTIONS: Define Allowed Methods
export async function OPTIONS() {
  return NextResponse.json({ allowedMethods: ["POST", "GET", "PATCH"] });
}
