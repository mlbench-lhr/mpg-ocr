import { POD } from "@/type/pod";
import React from "react";

interface Props {
  data: POD[];
}

const TableHeader = [
  "File ID",
  "CRTD_USR_CD",
  "CRTD_DTT",
  "SENT_FILE_DTT",
  "OCR_BOLNO",
  "OCR_ISSQTY",
  "OCR_RCVQTY",
  "OCR_STMP_SIGN",
  "OCR_SYMT_NONE",
  "OCR_SYMT_DAMG",
  "OCR_SYMT_SHRT",
  "OCR_SYMT_ORVG",
  "OCR_SYMT_REFS",
  "OCR_SYMT_SEAL",
  "RECV_DATA_DTT",
  "UPTD_USR_CD",
  "UPTD_DTT",
  "OCR_STMP_POD_DTT",
  "RNUM",
];

export default function PodTable({ data }: Props) {
  return (
    <table className="min-w-full bg-white border-gray-300">
      <thead>
        <tr className="text-xl text-gray-800">
          {TableHeader.map((heading) => (
            <th
              key={heading}
              className="py-2 px-4 border-b text-center font-medium"
            >
              {heading}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index} className="text-gray-600">
            {Object.values(item).map((value, idx) => (
              <td
                key={idx}
                className={`py-1 px-4 border-b text-center ${
                  typeof value === "string" && value.includes("T")
                    ? "text-gray-500"
                    : ""
                }`}
              >
                {value?.toString()?.includes("T")
                  ? new Date(value).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : value}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
