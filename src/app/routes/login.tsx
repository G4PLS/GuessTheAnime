import AnilistSync from "@/components/AnilistSync/AnilistSync";
import GameSettings from "@/components/GameSettings/GameSettings";
import { db } from "@/lib/database";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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
