interface Props {
  onReset: () => void;
  onApply: () => void;
  resetEnabled: boolean;
}

export default function FilterActions({ onReset, onApply, resetEnabled }: Props) {
  return (
    <div className="flex justify-end items-center gap-2 col-span-3">
      <button
        onClick={onReset}
        disabled={!resetEnabled}
        className={`px-4 py-2 rounded ${
          resetEnabled
            ? "text-[#005B97] underline"
            : "text-gray-400 underline cursor-not-allowed"
        }`}
      >
        Reset Filters
      </button>

      <button
        onClick={onApply}
        className="px-4 py-2 rounded-lg bg-[#005B97] text-white hover:bg-[#2270a3]"
      >
        Apply Filters
      </button>
    </div>
  );
}
