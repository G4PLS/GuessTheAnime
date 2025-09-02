import { useCurrentSettings, useMediaLists } from "@/app/hooks/databaseHooks";
import { db } from "@/lib/database";
import { useNavigate } from "react-router-dom";
import HintSelector from "../HintSelector/HintSelector";
import MediaListSelector from "../MediaListSelector/MediaListSelector";

export interface GameSettingsProps {
  loading: boolean;
}

export default function GameSettings({ loading }: GameSettingsProps) {
  const navigate = useNavigate();
  const settings = useCurrentSettings();
  const mediaLists = useMediaLists();

  return (
    <form
      onSubmit={() => {}}
      className="bg-blue-950 shadow-xl rounded-2xl p-6 flex flex-col gap-6 w-96"
    >
      <h2 className="text-2xl font-bold text-center text-white">
        Game Settings
      </h2>

      <MediaListSelector />
      <HintSelector />

      <button
        type="submit"
        onClick={async () => {
          await db.guessHistory.clear();
          await db.game.clear();

          //await db.resetGuesses();
          //await db.createGameState();
          navigate("/game");
        }}
        className="bg-blue-600 cursor-pointer text-white rounded-lg p-2 flex justify-center items-center transition hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-default disabled:hover:bg-blue-400"
        disabled={
          loading ||
          Object.values(settings?.selectedHints || {}).filter(Boolean)
            .length === 0 ||
          !settings?.anlistUsername ||
          mediaLists?.length === 0 ||
          settings.selectedListNames.length === 0
        }
      >
        Start Game
      </button>
    </form>
  );
}
