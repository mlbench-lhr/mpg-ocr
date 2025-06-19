import { Filter, ObjectId } from "mongodb";
import { format, parse } from "date-fns";
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

interface Job {
  _id?: ObjectId;
  OCR_BOLNO: string | number;
  jobName?: string;
  OCR_STMP_POD_DTT?: string;
  deliveryDate?: Date;
  OCR_STMP_SIGN?: string;
  OCR_ISSQTY?: number;
  OCR_RCVQTY?: number;
  OCR_SYMT_DAMG?: number;
  OCR_SYMT_SHRT?: number;
  OCR_SYMT_ORVG?: number;
  OCR_SYMT_REFS?: number;
  noOfPages?: number;
  OCR_SYMT_NONE?: string;
  finalStatus?: string;
  reviewStatus?: string;
  recognitionStatus?: string;
  breakdownReason?: string;
  reviewedBy?: string;
  cargoDescription?: string;
  CRTD_DTT?: string;
  updatedAt?: string;
  uptd_Usr_Cd?: string;
}

const DB_NAME = process.env.DB_NAME || "my-next-app";

export async function getJobsFromMongo(
  url: URL,
  skip: number,
  limit: number,
  page: number
) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const dataCollection = db.collection<Job>("mockData");

  const recognitionStatus = url.searchParams.get("recognitionStatus") || "";
  const reviewStatus = url.searchParams.get("reviewStatus") || "";
  const reviewByStatus = url.searchParams.get("reviewByStatus") || "";
  const breakdownReason = url.searchParams.get("breakdownReason") || "";
  const uptd_Usr_Cd = url.searchParams.get("uptd_Usr_Cd") || "";

  let podDate = url.searchParams.get("podDate") || "";
  const podDateSignature = url.searchParams.get("podDateSignature") || "";
  const bolNumber = url.searchParams.get("bolNumber") || "";
  const jobName = url.searchParams.get("jobName") || "";
  const searchQuery = url.searchParams.get("search") || "";
  const filter: Filter<Job> = {};

  const sortColumnsString = url.searchParams.get("sortColumn");
  const sortColumns = sortColumnsString ? sortColumnsString.split(",") : [];

  const sortOrderString = url.searchParams.get("sortOrder") || "asc";
  const sortOrders = sortOrderString.split(",");

  const sortQuery: Record<string, 1 | -1> = {};

  sortColumns.forEach((column, index) => {
    const order = sortOrders[index] === "desc" ? -1 : 1;
    sortQuery[column] = order;
  });

  if (sortOrders.length < sortColumns.length) {
    for (let i = sortOrders.length; i < sortColumns.length; i++) {
      sortQuery[sortColumns[i]] = 1;
    }
  }

  if (podDateSignature) {
    filter.OCR_STMP_SIGN = { $regex: podDateSignature.trim(), $options: "i" };
  }

  if (bolNumber) {
    if (/^\d+$/.test(bolNumber)) {
      filter.OCR_BOLNO = parseInt(bolNumber, 10);
    } else {
      filter.OCR_BOLNO = { $regex: bolNumber.trim(), $options: "i" };
    }
  }

  if (jobName) {
    filter.jobName = { $regex: jobName.trim(), $options: "i" };
  }

  if (uptd_Usr_Cd) {
    filter.uptd_Usr_Cd = { $regex: uptd_Usr_Cd.trim(), $options: "i" };
  }

  if (searchQuery) {
    const searchRegex = { $regex: searchQuery, $options: "i" };
    filter.$or = [
      { OCR_BOLNO: searchRegex },
      { jobName: searchRegex },
      { OCR_STMP_SIGN: searchRegex },
    ];
  }

  if (recognitionStatus) filter.recognitionStatus = recognitionStatus;
  if (reviewStatus) filter.reviewStatus = reviewStatus;
  if (reviewByStatus) filter.reviewedBy = reviewByStatus;
  if (breakdownReason) filter.breakdownReason = breakdownReason;

  if (podDate) {
    try {
      const parsedDate = parse(podDate, "yyyy-MM-dd", new Date());
      podDate = format(parsedDate, "MM/dd/yy");
      filter.OCR_STMP_POD_DTT = podDate;
    } catch (error) {
      console.log("Invalid podDate format:", error);
    }
  }

  const jobs = await dataCollection
    .find(filter)
    .sort(sortQuery)
    .skip(skip)
    .limit(limit)
    .toArray();
  const totalJobs = await dataCollection.countDocuments(filter);

  return NextResponse.json(
    { jobs, totalJobs, page, totalPages: Math.ceil(totalJobs / limit) },
    { status: 200 }
  );
}
