import Link from "next/link";
import { Log } from "@/app/logs/page";

interface Props {
  logs: Log[];
  selectedRows: string[];
  onRowSelect: (id: string) => void;
  onSelectAll: () => void;
  allSelected: boolean;
}

export default function LogTable({ logs, selectedRows, onRowSelect, onSelectAll, allSelected }: Props) {
  return (
    <table className="min-w-full bg-white border-gray-300">
      <thead>
        <tr className="text-xl text-gray-800">
          <th className="sticky left-0 bg-white py-2 px-4 border-b text-start min-w-44">
            <input type="checkbox" checked={allSelected} onChange={onSelectAll} /> File Name
          </th>
          <th className="py-2 px-4 border-b text-center">Message</th>
          <th className="py-2 px-4 border-b text-center">Submitted At</th>
          <th className="py-2 px-4 border-b text-center">Oracle Connection</th>
          <th className="py-2 px-4 border-b text-center">Status</th>
          <th className="py-2 px-4 border-b text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {logs.map((log) => (
          <tr key={log._id} className="text-gray-600">
            <td className="sticky left-0 bg-white py-2 px-4 border-b text-start">
              <input
                type="checkbox"
                checked={selectedRows.includes(log._id)}
                onChange={() => onRowSelect(log._id)}
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
        ))}
      </tbody>
    </table>
  );
}
