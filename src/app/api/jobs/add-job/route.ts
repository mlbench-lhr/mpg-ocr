import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");

let isConnected = false; // Track the connection state

async function connectToDatabase() {
    if (!isConnected) {
        await client.connect();
        isConnected = true;
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { selectedDays, fromTime, toTime, everyTime } = body;

        if (!selectedDays || selectedDays.length === 0 || !fromTime || !toTime || !everyTime) {
            return NextResponse.json({ error: "All fields are required." }, { status: 400 });
        }

        await client.connect();
        const db = client.db("my-next-app");
        const jobsCollection = db.collection("jobs");

        const result = await jobsCollection.insertOne({
            selectedDays,
            fromTime,
            toTime,
            everyTime,
            active: false,
            createdAt: new Date(),
        });

        return NextResponse.json(
            { message: "Job added successfully.", data: result },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error adding job:", error);
        return NextResponse.json({ error: "Failed to add job." }, { status: 500 });
    } finally {
        await client.close();
    }
}

// export async function GET(req: Request) {
//     try {
//         const url = new URL(req.url);
//         const page = parseInt(url.searchParams.get("page") || "1", 10);
//         const limit = 2;
//         const skip = (page - 1) * limit;

//         await client.connect();
//         const db = client.db("my-next-app");
//         const jobsCollection = db.collection("jobs");

//         const jobs = await jobsCollection.find().skip(skip).limit(limit).toArray();
//         const totalJobs = await jobsCollection.countDocuments();

//         return NextResponse.json(
//             { jobs, totalJobs, page, totalPages: Math.ceil(totalJobs / limit) },
//             { status: 200 }
//         );
//     } catch (error) {
//         console.error("Error fetching jobs:", error);
//         return NextResponse.json({ error: "Failed to fetch jobs." }, { status: 500 });
//     } finally {
//         await client.close();
//     }
// }

export async function GET(req: Request) {
    try {
        await connectToDatabase();
        await connectToDatabase();
        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get("page") || "1", 10);
        const limit = 2;
        const skip = (page - 1) * limit;
        const searchQuery = url.searchParams.get("search") || ""; // Get the search query

        const db = client.db("my-next-app");
        const jobsCollection = db.collection("jobs");

        let filter = {};

        if (searchQuery) {
            const isActive = searchQuery.toLowerCase() === "active" ? true : searchQuery.toLowerCase() === "inactive" ? false : null;
            if (isActive !== null) {
                filter = { active: isActive };
            } else {
                filter = { active: { $regex: searchQuery, $options: "i" } };
            }
        }

        const jobs = await jobsCollection.find(filter).skip(skip).limit(limit).toArray();
        const totalJobs = await jobsCollection.countDocuments(filter);

        return NextResponse.json(
            { jobs, totalJobs, page, totalPages: Math.ceil(totalJobs / limit) },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return NextResponse.json({ error: "Failed to fetch jobs." }, { status: 500 });
    }
}



export async function PATCH(req: Request) {
    try {
        const { id, active } = await req.json();

        if (!id || typeof active !== "boolean") {
            return NextResponse.json({ error: "Invalid input." }, { status: 400 });
        }

        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid ObjectId format." }, { status: 400 });
        }

        const objectId = new ObjectId(id);

        await client.connect();
        const db = client.db("my-next-app");
        const jobsCollection = db.collection("jobs");

        const result = await jobsCollection.updateOne(
            { _id: objectId },
            { $set: { active } }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "Job not found." }, { status: 404 });
        }

        return NextResponse.json({ message: "Job status updated successfully." }, { status: 200 });
    } catch (error) {
        console.error("Error updating job status:", error);
        return NextResponse.json({ error: "Failed to update job status." }, { status: 500 });
    } finally {
        await client.close();
    }
}

export async function OPTIONS() {
    return NextResponse.json({ allowedMethods: ["POST", "GET", "PATCH"] });
}
