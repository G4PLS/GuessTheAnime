import { useCurrentSettings } from "@/app/hooks/databaseHooks";
import { db } from "@/lib/database";
import { fetchList } from "@/lib/fetchList";
import { ArrowPathIcon } from "@heroicons/react/16/solid";
import { useState } from "react";

export interface AnilistSyncProps {
    loading: boolean;
    onLoad: (loading: boolean) => void;
}

export default function AnilistSync({loading, onLoad}: AnilistSyncProps) {
  const settings = useCurrentSettings();
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async (e: React.FormEvent) => {
    console.log("HANDLING FETCH");

    e.preventDefault();
    onLoad(true);

    try {
      if (!settings?.anlistUsername) return;

      const list = await fetchList(settings.anlistUsername);

      if (!list) {
        setError("Failed to fetch media list. Please check your username.");
      } else {
        console.log("FETCHED CORRECTLY");
        setError(null);
        await db.createFromMediaListCollectionResponse(
          settings.anlistUsername,
          list
        );
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
        onLoad(false);
    }
  };

  return (
    <form
      onSubmit={handleFetch}
      className="bg-blue-950 shadow-xl rounded-2xl p-6 flex flex-col gap-6 w-96"
    >
      <h2 className="text-2xl font-bold text-center text-white">
        Guess the Anime
      </h2>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div>
        <label
          htmlFor="username-entry"
          className="block text-sm font-medium text-gray-200"
        >
          AniList Username
        </label>

        <div className="flex flex-row gap-3">
          <input
            type="text"
            id="username-entry"
            placeholder="Enter your AniList name"
            value={settings?.anlistUsername ?? ""}
            onChange={(e) =>
              db.settings.update("current", {
                anlistUsername: e.target.value,
              })
            }
            className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-500"
          />

          <button
            type="submit"
            className="bg-blue-600 cursor-pointer text-white rounded-lg p-2 flex justify-center items-center transition hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-default disabled:hover:bg-blue-400"
            disabled={loading || !settings?.anlistUsername}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <ArrowPathIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
