interface Props {
  value: number | "";
  onChange: (val: number | "") => void;
}

export default function LimitInput({ value, onChange }: Props) {
  return (
    <>
      <label className="mb-1 text-sm font-semibold text-gray-800">
        Maximum No. of Hits
      </label>
      <div className="grid grid-cols-3">
        <input
          type="text"
          className="w-full px-4 py-2 mt-1 pr-10 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97] appearance-none"
          value={value}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "") return onChange("");
            const parsed = parseInt(value, 10);
            if (!isNaN(parsed)) onChange(parsed);
          }}
        />
      </div>
    </>
  );
}
