const cron = require("node-cron");
const fetch = require("node-fetch");

console.log("✅ Cron job script started...");

cron.schedule("*/5 * * * *", async () => {
  try {
    const response = await fetch("http://localhost:3000/api/pod/retrieve");
    const data_1 = await response.json();

    const res = await fetch("http://localhost:3000/api/ipAddress/ip-address");
    const data_2 = await res.json();

    let ocrUrl, baseUrl;

    if (data_2.ip) {
      ocrUrl = `http://${data_2.ip}:8080/run-ocr`;
      baseUrl = `http://${data_2.secondaryIp}:3000`;
    }

    const file_response = await fetch(`http://localhost:3000/api/pod/file?fileId=${data_1.fileId}&fileTable=${data_1.fileTable}`);
    // const file_response = await fetch(`http://localhost:3000/api/pod/file?fileId=POD_001&fileTable=XTI_2024_T`);
    const data_3 = await file_response.json();
    if (file_response.ok) {

      const insertRes = await fetch("http://localhost:3000/api/pod/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: data_3.FILE_ID }),
      });

      const insertData = await insertRes.json();
      console.log("Insert Response:", insertData);

      const fileData = {
        jobId: "",
        fileId: data_3.FILE_ID,
        pdfUrl: data_3.FILE_PATH,
        deliveryDate: "",
        noOfPages: 0,
        blNumber: "",
        podDate: "",
        podSignature: "",
        totalQty: "",
        received: "",
        damaged: "",
        short: "",
        over: "",
        refused: "",
        customerOrderNum: "",
        stampExists: "",
        finalStatus: "new",
        reviewStatus: "unConfirmed",
        recognitionStatus: "new",
        breakdownReason: "none",
        reviewedBy: "",
        cargoDescription: "",
      };

      fetch("http://localhost:3000/api/process-data/save-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([fileData]),
      })
        .then((response) => response.json())
        .then((result) => console.log("Response:", result))
        .catch((error) => console.error("Error:", error));

      // console.log("Cron Job Triggered:", baseUrl);

      let filePath = `${baseUrl}/api/access-file?filename=${encodeURIComponent(data_3.FILE_NAME)}`;

      const ocrResponse = await fetch(ocrUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_url_or_path: filePath }),
      });

      if (!ocrResponse.ok) {
        const errorData = await ocrResponse.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to process OCR");
      }

      const ocrData = await ocrResponse.json();


      if (ocrData && Array.isArray(ocrData)) {
        const processedDataArray = ocrData.map((data) => {
          const recognitionStatusMap = {
            failed: "failure",
            "partially valid": "partiallyValid",
            valid: "valid",
            null: "null",
          };

          const status = recognitionStatusMap[data?.Status] || "null";
          const recognitionStatus = recognitionStatusMap[status] || "null";

          const urlObj = new URL(filePath);
          const filename = urlObj.searchParams.get("filename") || "";
          const decodedFilePath = `/file/${decodeURIComponent(filename)}`;

          return {
            jobId: null,
            pdfUrl: decodedFilePath,
            deliveryDate: new Date().toISOString().split("T")[0],
            noOfPages: 1,
            blNumber: data?.B_L_Number ? String(data.B_L_Number) : "",
            podDate: data?.POD_Date || "",
            podSignature:
              data?.Signature_Exists === "yes"
                ? "yes"
                : data?.Signature_Exists === "no"
                  ? "no"
                  : data?.Signature_Exists,
            totalQty: isNaN(data?.Issued_Qty) ? data?.Issued_Qty : Number(data?.Issued_Qty),
            received: isNaN(data?.Received_Qty) ? data?.Received_Qty : Number(data?.Received_Qty),

            damaged: data?.Damage_Qty,
            short: data?.Short_Qty,
            over: data?.Over_Qty,
            refused: data?.Refused_Qty,

            customerOrderNum: data?.Customer_Order_Num,
            stampExists:
              data?.Stamp_Exists === "yes"
                ? "yes"
                : data?.Stamp_Exists === "no"
                  ? "no"
                  : data?.Stamp_Exists,
            finalStatus: "valid",
            reviewStatus: "unConfirmed",
            recognitionStatus: recognitionStatus,
            breakdownReason: "none",
            reviewedBy: "OCR Engine",
            cargoDescription: "Processed from OCR API.",
            none: "N",
            sealIntact: "N",
          };
        });

        const processedDataObject = processedDataArray.length > 0 ? processedDataArray[0] : {};

        const check_res = await fetch("http://localhost:3000/api/settings/auto-confirmation");
        const data_4 = await check_res.json();
        const check = data_4.isAutoConfirmationOpen;

        if (check) {
          const fileId = data_3.FILE_ID;
          console.log("fileId:", fileId);
          fetch("http://localhost:3000/api/pod/update", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileId, ocrData: processedDataObject }),
          })
            .then((res) => res.json())
            .then((data) => console.log("Update Response:", data))
            .catch((error) => console.error("Update Error:", error));
        }
        const saveResponse = await fetch("http://localhost:3000/api/process-data/save-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(processedDataArray),
        });


        if (!saveResponse.ok) {
          console.error("Error saving data:", await saveResponse.json());
        } else {
          // console.log("OCR data saved successfully.");
        }
      }

    } 
  } catch (error) {
    console.error("Cron Job Error:", error);
  }
});
