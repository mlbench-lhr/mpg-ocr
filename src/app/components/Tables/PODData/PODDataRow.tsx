import React from "react";
import { POD } from "@/type/pod";

interface PODDataRowProps {
  item: POD;
}

export default function PODDataRow({ item }: PODDataRowProps) {
  return (
    <tr className="text-gray-600">
      {Object.values(item).map((value, idx) => (
        <td
          key={idx}
          className={`py-1 px-4 border-b text-center ${
            typeof value === "string" && value.includes("T")
              ? "text-gray-500"
              : ""
          }`}
        >
          {typeof value === "string" && value.includes("T")
            ? new Date(value).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : value}
        </td>
      ))}
    </tr>
  );
}
