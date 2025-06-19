import React, { useState } from "react";

interface FileNameCellProps {
  pdfUrl?: string;
  fileId?: string;
}

const FileNameCell = ({ pdfUrl, fileId }: FileNameCellProps) => {
  const [showFull, setShowFull] = useState(false);

  // Extract file name from either pdfUrl or fileId
  const fileName = pdfUrl?.split("/").pop() || fileId || "No PDF Available";
  console.log("Filename ->",fileName);

  const isTruncated = fileName.length > 15 && !showFull;
  const displayName = isTruncated ? fileName.substring(0, 15) + "..." : fileName;

  return (
    <td
      className={`py-2 px-4 border-b text-center sticky left-44 bg-white z-10 min-w-44 max-w-44 cursor-pointer ${
        isTruncated ? "truncate" : "whitespace-normal break-words"
      }`}
      onClick={() => setShowFull((prev) => !prev)}
      title={!showFull ? "Click to show full name" : "Click to hide"}
    >
      {displayName}
    </td>
  );
};

export default FileNameCell;
