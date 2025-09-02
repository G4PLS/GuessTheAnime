import { useCallback } from "react";
import { useCurrentSettings, useMediaLists } from "@/app/hooks/databaseHooks";
import { db } from "@/lib/database";

export default function MediaListSelector() {
  const settings = useCurrentSettings();
  const mediaLists = useMediaLists();

  const toggleListSelection = useCallback(
    (listName: string) => {
      if (!settings) return;

      const current = settings.selectedListNames ?? [];
      const newSelection = current.includes(listName)
        ? current.filter((n) => n !== listName)
        : [...current, listName];

      db.settings.update("current", { selectedListNames: newSelection });
    },
    [settings]
  );

  if (!mediaLists || !settings) return null;

  return (
    <fieldset className="flex flex-col gap-3 p-4 border border-gray-700 rounded-lg bg-gray-900 text-white">
      <legend className="font-semibold text-lg mb-2">Fetched Lists</legend>

      <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: `${5 * 40}px` }}>
        {mediaLists.map(({ listName, totalEntries }) => (
          <MediaListItem
            key={listName}
            listName={listName}
            totalEntries={totalEntries}
            selected={settings.selectedListNames.includes(listName)}
            onToggle={() => toggleListSelection(listName)}
          />
        ))}
      </div>
    </fieldset>
  );
}

interface MediaListItemProps {
  listName: string;
  totalEntries: number;
  selected: boolean;
  onToggle: () => void;
}

function MediaListItem({ listName, totalEntries, selected, onToggle }: MediaListItemProps) {
  return (
    <label className="flex justify-between items-center gap-3 p-2 rounded hover:bg-gray-800 cursor-pointer transition">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="w-4 h-4 accent-blue-500"
        />
        <span className="font-medium">{listName}</span>
      </div>
      <span className="text-gray-400 text-sm">{totalEntries} entries</span>
    </label>
  );
}
