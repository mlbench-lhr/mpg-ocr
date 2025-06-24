import Link from "next/link";
import { Log } from "@/app/logs/page";

interface LogDataRowProps {
  log: Log;
  selected: boolean;
  onSelect: (id: string) => void;
}

export default function LogDataRow({ log, selected, onSelect }: LogDataRowProps) {
  return (
    <tr key={log._id} className="text-gray-600">
      <td className="sticky left-0 bg-white py-2 px-4 border-b text-start">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(log._id)}
        />
        <Link
          href={`/extracted-data-monitoring/${log._id}`}
          className="ml-2 text-[#005B97] underline hover:text-blue-500"
        >
          {log.fileName}
        </Link>
      </td>
      <td className="py-1 px-4 border-b text-center">{log.message}</td>
      <td className="py-1 px-4 border-b text-center text-gray-500">
        {new Date(log.timestamp).toLocaleDateString("en-US")}
      </td>
      <td className="py-1 px-4 border-b text-center">{log.connectionResult}</td>
      <td className="py-1 px-4 border-b text-center">{log.status}</td>
      <td className="py-1 px-4 border-b text-center">
        <Link href={`/logs/${log._id}`} className="text-[#005B97] hover:underline">
          Details
        </Link>
      </td>
    </tr>
  );
}
