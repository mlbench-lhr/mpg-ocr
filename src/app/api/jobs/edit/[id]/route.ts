import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse, NextRequest } from "next/server";
// Define the PDFCriteria type
interface PDFCriteria {
  fromTime: Date;
  toTime: Date;
}

// Use the MongoClient promise directly to avoid creating new instances on each request.
const client = await clientPromise; 

export async function GET(req: NextRequest) {
  try {
    const id = new URL(req.url).pathname.split("/").pop();  // Extract job ID from URL path

    const db = client.db("my-next-app");
    const jobsCollection = db.collection("jobs");

    const job = await jobsCollection.findOne({ _id: new ObjectId(id) });

    if (!job) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json({ error: "Failed to fetch job." }, { status: 500 });
  }
}

// export async function PATCH(req: NextRequest) {
//   try {
//     const id = new URL(req.url).pathname.split("/").pop();  // Extract job ID from URL path
//     const body = await req.json();
//     const { selectedDays, fromTime, toTime, everyTime, active } = body;

//     if (!selectedDays || selectedDays.length === 0 || !fromTime || !toTime || !everyTime) {
//       return NextResponse.json({ error: "All fields are required." }, { status: 400 });
//     }

//     const db = client.db("my-next-app");
//     const jobsCollection = db.collection("jobs");

//     const result = await jobsCollection.updateOne(
//       { _id: new ObjectId(id) },
//       {
//         $set: {
//           selectedDays,
//           fromTime,
//           toTime,
//           everyTime,
//           active,
//           updatedAt: new Date(),
//         },
//       }
//     );

//     if (result.matchedCount === 0) {
//       return NextResponse.json({ error: "Job not found." }, { status: 404 });
//     }

//     return NextResponse.json({ message: "Job updated successfully." });
//   } catch (error) {
//     console.error("Error updating job:", error);
//     return NextResponse.json({ error: "Failed to update job." }, { status: 500 });
//   }
// }


export async function PATCH(req: NextRequest) {
  try {
    const id = new URL(req.url).pathname.split("/").pop();  // Extract job ID from URL path
    const body = await req.json();
    const { selectedDays, fromTime, toTime, everyTime, active } = body;

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

    // Connect to the MongoDB collection
    const db = client.db("my-next-app");
    const jobsCollection = db.collection("jobs");

    // Update the job in MongoDB
    const result = await jobsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          selectedDays,
          fromTime,
          toTime,
          everyTime,
          active,
          pdfCriteria: pdfCriteria,
          updatedAt: new Date(),
        },
      }
    );

    // If no job was found, return a 404 error
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    // Return success response
    return NextResponse.json({ message: "Job updated successfully." });
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json({ error: "Failed to update job." }, { status: 500 });
  }
}

