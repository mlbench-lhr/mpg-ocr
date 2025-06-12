const cron = require("node-cron");
const fetch = require("node-fetch");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const isBetween = require("dayjs/plugin/isBetween");

dayjs.extend(utc);
dayjs.extend(isBetween);

let cronJobCounter = 1;
console.log("✅ OCR Cron Job Script Initialized");

async function runOcrForJob(job, ocrUrl, baseUrl, wmsUrl, userName, passWord) {
  console.log("ocr script started.");

  try {
    const retrieveRes = await fetch("http://localhost:3000/api/pod/retrieve");

    const fileList = await retrieveRes.json();
    console.log("file list-> ", fileList);

    for (const item of fileList) {
      try {
        const fileId = item.FILE_ID || item.file_id;
        const fileTable = item.FILE_TABLE || item.file_table;
        const fileRes = await fetch(
          `http://localhost:3000/api/pod/file?fileId=${fileId}&fileTable=${fileTable}`
        );
        if (!fileRes.ok) continue;

        const fileData = await fileRes.json();
        console.log("file data-> ", fileData);
        await fetch("http://localhost:3000/api/pod/store", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileId: fileData.FILE_ID }),
        });
        
        const filePath = `${baseUrl}/api/access-file?filename=${encodeURIComponent(
          fileData.FILE_NAME
        )}`;
        console.log("file path-> ", filePath);
        const ocrRes = await fetch(ocrUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file_url_or_path: filePath }),
        });

        if (!ocrRes.ok) {
          const errJson = await ocrRes.json().catch(() => null);
          throw new Error(errJson?.error || "OCR Failed");
        }

        const ocrData = await ocrRes.json();
        if (!Array.isArray(ocrData)) continue;

        const processed = ocrData.map((d) => ({
          jobId: job._id,
          pdfUrl: decodeURIComponent(
            new URL(filePath).searchParams.get("filename") || ""
          ),
          deliveryDate: new Date().toISOString().split("T")[0],
          noOfPages: 1,
          blNumber: String(d?.B_L_Number || ""),
          podDate: d?.POD_Date || "",
          podSignature: d?.Signature_Exists || "unknown",
          totalQty: Number(d?.Issued_Qty) || 0,
          received: Number(d?.Received_Qty) || 0,
          damaged: d?.Damage_Qty,
          short: d?.Short_Qty,
          over: d?.Over_Qty,
          refused: d?.Refused_Qty,
          customerOrderNum: d?.Customer_Order_Num,
          stampExists: d?.Stamp_Exists,
          finalStatus: "valid",
          reviewStatus: "unConfirmed",
          recognitionStatus:
            {
              failed: "failure",
              valid: "valid",
              "partially valid": "partiallyValid",
            }[d?.Status] || "null",
          breakdownReason: "none",
          reviewedBy: "OCR Engine",
          cargoDescription: "Processed from OCR API.",
          none: "N",
          sealIntact: d?.Seal_Intact === "yes" ? "Y" : "N",
        }));

        const single = processed[0];

        // SAP BOL matching
        try {
          const basicAuth = Buffer.from(`${userName}:${passWord}`).toString(
            "base64"
          );
          const response = await fetch(wmsUrl, {
            method: "POST",
            headers: {
              Authorization: `Basic ${basicAuth}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ BOLNo: [single.blNumber] }),
          });

          const sapData = await response.json();
          if (sapData[0]?.BOLNo?.trim() === single.blNumber.trim()) {
            single.recognitionStatus = "valid";
            processed[0].recognitionStatus = "valid";
          } else {
            single.recognitionStatus = "failure";
            processed[0].recognitionStatus = "failure";
          }
        } catch (err) {
          console.error("SAP check error:", err.message);
        }

        const confirmRes = await fetch(
          "http://localhost:3000/api/settings/auto-confirmation"
        );
        const confirmJson = await confirmRes.json();

        if (confirmJson.isAutoConfirmationOpen) {
          await fetch("http://localhost:3000/api/pod/update", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileId: fileData.FILE_ID,
              ocrData: single,
            }),
          });
        }

        await fetch("http://localhost:3000/api/process-data/save-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(processed),
        });

        console.log(`✅ File ${fileId} processed.`);
      } catch (err) {
    console.error("❌ File processing error:", err);

      }
    }
  } catch (err) {
    console.error("OCR job error:", err.message);
  }
}

async function scheduleJobs() {
  try {
    const dbResponse = await fetch("http://localhost:3000/api/auth/public-db");
    const dbData = await dbResponse.json();

    if (dbData?.database !== "remote") {
      console.log("Database is not remote. Skipping job scheduling.");
      return;
    }

    // Fetch necessary data (IP, OCR URL, WMS URL, jobs)
    const ipRes = await fetch("http://localhost:3000/api/ipAddress/ip-address");
    const ipData = await ipRes.json();
    const baseUrl = `http://${ipData.secondaryIp}:3000`;
    const ocrUrl = `http://${ipData.ip}:8080/run-ocr`;

    const wmsRes = await fetch("http://localhost:3000/api/save-wms-url");
    const {
      wmsUrl,
      username: userName,
      password: passWord,
    } = await wmsRes.json();

    const jobRes = await fetch("http://localhost:3000/api/jobs/get-job");
    const jobJson = await jobRes.json();
    const jobs = jobJson.activeJobs;

    for (const job of jobs) {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTimeStr = `${String(currentHours).padStart(2, "0")}:${String(
        currentMinutes
      ).padStart(2, "0")}`;

      const fromTime = new Date(job.pdfCriteria.fromTime);
      const toTime = new Date(job.pdfCriteria.toTime);

      const fromHours = String(fromTime.getUTCHours()).padStart(2, "0");
      const fromMinutes = String(fromTime.getUTCMinutes()).padStart(2, "0");
      const toHours = String(toTime.getUTCHours()).padStart(2, "0");
      const toMinutes = String(toTime.getUTCMinutes()).padStart(2, "0");

      const fromTimeStr = `${fromHours}:${fromMinutes}`;
      const toTimeStr = `${toHours}:${toMinutes}`;

      const currentDay = now.toLocaleString("en-US", { weekday: "long" });

      console.log(
        "from time-> ",
        fromTimeStr,
        "to time-> ",
        toTimeStr,
        "current time-> ",
        currentTimeStr,
        "current day-> ",
        currentDay
      );

      if (
        job.selectedDays.includes(currentDay) &&
        currentTimeStr >= fromTimeStr &&
        currentTimeStr <= toTimeStr
      ) {
        console.log("Ready to start the OCR for JOB...");
        runOcrForJob(job, ocrUrl, baseUrl, wmsUrl, userName, passWord);
      }
    }
  } catch (err) {
    console.error("❌ Scheduling failed:", err.message);
  }
}

cron.schedule("*/1 * * * *", async () => {
  const jobId = cronJobCounter++;
  console.log(
    `✅ OCR Cron Job #${jobId} Started at ${new Date().toISOString()}`
  );
  scheduleJobs();
});
