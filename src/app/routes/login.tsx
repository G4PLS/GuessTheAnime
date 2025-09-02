import { fetchList } from "@/lib/fetchList"; // your fetchList function
import { ArrowPathIcon } from "@heroicons/react/16/solid";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  useCurrentSettings,
  useMediaListEntries,
  useMediaLists,
} from "../hooks/databaseHooks";
import { db, type Hints } from "@/lib/database";
import MediaListSelector from "@/components/MediaListSelector/MediaListSelector";
import HintSelector from "@/components/HintSelector/HintSelector";
import GameSettings from "@/components/GameSettings/GameSettings";
import AnilistSync from "@/components/AnilistSync/AnilistSync";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const mediaLists = useMediaLists();

  useEffect(() => {
    db.settings.get("current").then((settings) => {
      if (!settings)
        db.settings.put({
          id: "current",
          anlistUsername: "",
          selectedListNames: [],
          selectedHints: {
            season: false,
            format: false,
            studios: false,
            rating: false,
            popularity: false,
            genres: false,
            tags: false,
            review: false,
            recommendations: false,
            description: false,
          },
        });
    });
  }, []);

  
  return (
    <div className="flex flex-row gap-5 w-full h-full justify-center items-center">
      <AnilistSync loading={loading} onLoad={setLoading}></AnilistSync>
      <GameSettings loading={loading}></GameSettings>
    </div>
  );
}
