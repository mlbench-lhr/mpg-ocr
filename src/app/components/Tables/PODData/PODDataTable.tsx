import { POD } from "@/type/pod";
import React from "react";
import PODDataRow from "./PODDataRow";

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
          <PODDataRow key={index} item={item} />
        ))}
      </tbody>
    </table>
  );
}
