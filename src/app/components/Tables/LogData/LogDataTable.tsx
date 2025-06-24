import Link from "next/link";
import { Log } from "@/app/logs/page";
import LogDataRow from "./LogDataRow";

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
        <LogDataRow
        key={log._id}
        log={log}
        selected={selectedRows.includes(log._id)}
        onSelect={onRowSelect}
      />
        ))}
      </tbody>
    </table>
  );
}
