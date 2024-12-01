import { NextResponse } from "next/server";
import { startCronJob } from "../../../lib/corn";

let cronStarted = false;

export async function GET() {
  if (!cronStarted) {
    startCronJob();
    cronStarted = true;
  }
  return NextResponse.json({ message: "Cron job started successfully!" });
}
