import cron from "node-cron";

export function startCronJob() {
  // Schedule a task to run every minute
  cron.schedule("* * * * *", () => {
    console.log("Cron job executed at", new Date().toISOString());
    // Add your logic here (e.g., call an API, clean the database, etc.)
  });
}
