import { useCallback } from "react";
import { useCurrentSettings } from "@/app/hooks/databaseHooks";
import { db, type Hints } from "@/lib/database";

export default function HintSelector() {
  const settings = useCurrentSettings();
  const selectedHints = settings?.selectedHints ?? {};

  const selectedCount = Object.values(selectedHints).filter(Boolean).length;

  const toggleHint = useCallback(
    (hintKey: keyof Hints) => {
      const newHints = {
        ...selectedHints,
        [hintKey]: !selectedHints[hintKey],
      };
      db.settings.update("current", { selectedHints: newHints });
    },
    [selectedHints]
  );

  return (
    <div className="flex flex-col gap-2 p-4 border border-gray-700 rounded-lg bg-gray-900 text-white">
      <legend className="font-semibold text-lg mb-2">Select Hints (max 5)</legend>

      <div
        className="flex flex-col gap-2 overflow-y-auto"
        style={{ maxHeight: `${5 * 40}px` }}
      >
        {Object.entries(selectedHints).map(([hintKey, isSelected]) => (
          <HintItem
            key={hintKey}
            hintKey={hintKey as keyof Hints}
            isSelected={!!isSelected}
            disabled={!isSelected && selectedCount >= 5}
            onToggle={toggleHint}
          />
        ))}
      </div>
    </div>
  );
}

interface HintItemProps {
  hintKey: keyof Hints;
  isSelected: boolean;
  disabled: boolean;
  onToggle: (hintKey: keyof Hints) => void;
}

function HintItem({ hintKey, isSelected, disabled, onToggle }: HintItemProps) {
  return (
    <label className="flex justify-between items-center gap-3 p-2 rounded hover:bg-gray-800 cursor-pointer transition">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isSelected}
          disabled={disabled}
          onChange={() => onToggle(hintKey)}
          className="w-4 h-4 accent-blue-500"
        />
        <span className="font-medium capitalize">{hintKey}</span>
      </div>
    </label>
  );
}
