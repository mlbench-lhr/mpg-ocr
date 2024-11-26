import { NextResponse } from "next/server";
import { startCronJob } from "../../../../lib/corn";

let cronStarted = false;

export async function GET() {
  if (!cronStarted) {
    startCronJob();
    cronStarted = true; // Prevent multiple cron job executions
  }
  return NextResponse.json({ message: "Cron job started successfully!" });
}
