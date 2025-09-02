import { db, type GameState, type Guess } from "@/lib/database";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCurrentGame,
  useCurrentMedia,
  useRemainingMedia,
} from "../hooks/databaseHooks";
import SearchBar from "@/components/GuessField/GuessField";

export default function Game() {
  const navigate = useNavigate();
  const game = useCurrentGame();
  const currentMedia = useCurrentMedia(); // Comes from game.state
  const [currentGuess, setCurrentGuess] = useState<string>("");

  const MAX_ATTEMPTS = 8;

  const animeList = useRemainingMedia();

  const guessedCount = game?.state?.guesses.length ?? 0;
  const totalCount = guessedCount + (animeList?.length ?? 0);
  const attempts = game?.state?.guesses.length ?? 0;

  const state = game?.state;

  async function guess() {
    if (!currentMedia || !game) return;

    const attemptsSoFar = game!.state!.guesses.length;

    const title = currentGuess;

    // Check if the guess is correct
    const guessIsCorrect =
      (currentMedia.media.title.english ?? "").toLowerCase() ===
        title.toLowerCase() ||
      (currentMedia.media.title.romaji ?? "").toLowerCase() ===
        title.toLowerCase();

    // Create new guess object
    const newGuess: Guess = {
      attempt: attemptsSoFar + 1,
      mediaId: currentMedia.id!,
      guessedMediaName: title,
      correct: attemptsSoFar < MAX_ATTEMPTS && guessIsCorrect,
    };

    const updatedGuesses = [...game!.state!.guesses, newGuess];

    // Determine if round is over
    const roundOver = newGuess.correct || updatedGuesses.length >= MAX_ATTEMPTS;

    // Progressive hints
    const hintUnlocks: (keyof GameState)[] = [
      "review",
      "studio",
      "genres",
      "format",
      "release",
      "tags",
      "similar",
    ];

    const newHints: Partial<GameState> = {};
    hintUnlocks.forEach((hint, index) => {
      // Reveal this hint if the user has reached this attempt
      newHints[hint] = attemptsSoFar >= index;
    });

    if (roundOver) {
      // Save current guesses to history
      await db.guessHistory.add({
        guesses: updatedGuesses,
        mediaId: currentMedia.id!,
        completedAt: new Date(),
      });

      // Pick next media
      const remaining = await db.media
        .where("id")
        .noneOf(updatedGuesses.map((g) => g.mediaId))
        .toArray();

      const nextMedia = remaining.length
        ? remaining[Math.floor(Math.random() * remaining.length)]
        : null;

      // Reset game state for next round
      await db.game.update("current", {
        state: {
          currentMediaId: nextMedia?.id ?? 0,
          guesses: [],
          format: false,
          genres: false,
          release: false,
          review: false,
          similar: false,
          studio: false,
          tags: false,
        },
      });
    } else {
      // Just update guesses and reveal hints
      await db.game.update("current", {
        state: {
          ...game!.state!,
          guesses: updatedGuesses,
          ...newHints,
        },
      });
    }
  }

  useEffect(() => {
    const init = async () => {
      const gameState = await db.game.get("current");

      if (!gameState) {
        navigate("/login");
        return;
      }

      if (!gameState.state || gameState.state.currentMediaId === 0) {
        const allMedia = await db.media.toArray();
        if (allMedia.length === 0) return;

        const randomMedia =
          allMedia[Math.floor(Math.random() * allMedia.length)];

        await db.game.put({
          id: "current",
          state: {
            currentMediaId: randomMedia.id!,
            guesses: [],
            hints: {
              season: false,
              format: false,
              studios: false,
              rating: false,
              genres: false,
              tags: false,
              review: false,
              recommendations: false,
              description: false,
            },
          },
        });
      }
    };

    init();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-gray-900 text-white p-4 overflow-hidden">
      {/* Play Area */}
      <div className="grid grid-cols-2 gap-4 bg-gray-800 p-4 rounded-xl w-4/6 h-4/6 min-h-0 overflow-auto">
        {/* Left Column */}
        <div className="flex flex-col gap-4 min-h-0">
          {/* Review + Description */}
          <div className="flex flex-row gap-4 flex-9 min-h-0">
            {/* Review */}
            <div className="bg-gray-700 p-3 rounded-lg flex-1 min-w-0 flex flex-col">
              <h2 className="font-bold">REVIEW</h2>
              <p className="flex-1 text-sm overflow-auto min-h-0">
                [Minor spoiler ahead] What do you get when you mash well
                thought-out ideas from other great sci-fi cop shows into a stew
                and then leave that stew on a oven that's not turned on? A cold
                mess. ID:Invaded as a product is a cold mess. I can't help but
                try to understand what people are praising about this and wonder
                to myself if we even watched the same show. Yes, it's not awful
                and in a landscape of established IPs and forced squeals/remakes
                having an original anime come out is fantastic, but is the bar
                set so low that this show is considered good? I suppose ...
              </p>
            </div>

            {/* Description */}
            <div className="bg-gray-700 p-3 rounded-lg flex-1 min-w-0 flex flex-col">
              <h2 className="font-bold">DESCRIPTION</h2>
              <p className="flex-1 text-sm overflow-auto min-h-0">
                The Mizuhanome System is a highly advanced development that
                allows people to enter one of the most intriguing places in
                existence—the human mind. Through the use of so-called
                "cognition particles" left behind at a crime scene by the
                perpetrator, detectives from the specialized police squad Kura
                can manifest a criminal's unconscious mind as a bizarre stream
                of thoughts in a virtual world. Their task is to explore this
                psychological plane, called an "id well," to reveal the identity
                of the culprit. Not just anyone can enter the id wells; the
                prerequisite is that you must have killed someone yourself. Such
                is the case for former detective Akihito Narihisago, who is
                known as "Sakaido" inside the id wells. Once a respected member
                of the police, tragedy struck, and he soon found himself on the
                other side of the law. Nevertheless, Narihisago continues to
                assist Kura in confinement. While his prodigious detective
                skills still prove useful toward investigations, Narihisago
                discovers that not everything is as it seems, as behind the
                seemingly standalone series of murder cases lurks a much more
                sinister truth.
              </p>
            </div>
          </div>

          {/* Season + Format */}
          <div className="grid grid-cols-2 gap-2 flex-1 min-w-0">
            <div className="bg-gray-700 p-2 rounded-lg text-center">
              <h3 className="font-bold">SEASON</h3>
              <p className="text-sm">Summer 2023</p>
            </div>
            <div className="bg-gray-700 p-2 rounded-lg text-center">
              <h3 className="font-bold">FORMAT</h3>
              <p className="text-sm">TV (12 Eps)</p>
            </div>
          </div>

          {/* Rating + Popularity */}
          <div className="grid grid-cols-2 gap-2 flex-1 min-w-0">
            <div className="bg-gray-700 p-2 rounded-lg text-center">
              <h3 className="font-bold">RATING</h3>
              <p className="text-sm">Mean: 5.2 | Avg: 3.5 | ZFChris: 9.0</p>
            </div>
            <div className="bg-gray-700 p-2 rounded-lg text-center">
              <h3 className="font-bold">POPULARITY</h3>
              <p className="text-sm">#1234</p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4 min-h-0">
          <div className="flex flex-row gap-4 flex-1 min-h-0">
            {/* Tags */}
            <div className="bg-gray-700 p-3 rounded-lg flex-1 min-w-0 flex flex-col">
              <h2 className="font-bold mb-2">TAGS</h2>
              <div className="flex-1 overflow-auto min-h-0">
                {[
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "B", rank: 95 },
                  // ...more items
                ].map((tag, i) => (
                  <p key={i}>{tag.name}</p>
                ))}
              </div>
            </div>

            {/* Genres */}
            <div className="bg-gray-700 p-3 rounded-lg flex-1 min-w-0 flex flex-col">
              <h2 className="font-bold mb-2">Genres</h2>
              <div className="flex-1 overflow-auto min-h-0">
                {[
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "B", rank: 95 },
                  // ...more items
                ].map((tag, i) => (
                  <p key={i}>{tag.name}</p>
                ))}
              </div>
            </div>

            {/* Studios */}
            <div className="bg-gray-700 p-3 rounded-lg flex-1 min-w-0 flex flex-col">
              <h2 className="font-bold mb-2">Studios</h2>
              <div className="flex-1 overflow-auto min-h-0">
                {[
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "A", rank: 95 },
                  { name: "B", rank: 95 },
                  // ...more items
                ].map((tag, i) => (
                  <p key={i}>{tag.name}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Similar */}
          <div className="bg-gray-700 p-3 rounded-lg flex-1 min-w-0 flex flex-col">
            <h2 className="font-bold mb-2">SIMILAR</h2>
            <div className="flex-1 flex flex-grow gap-2 overflow-x-auto">
              <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                Img
              </div>
              <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                Img
              </div>
              <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                Img
              </div>
              <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                Img
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guess Area */}
      <div className="w-4/6 flex flex-col items-center mt-6">
        {/* Pagination */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              className="px-3 py-1 bg-gray-700 rounded-md hover:bg-gray-600"
            >
              {n}
            </button>
          ))}
          <button className="px-3 py-1 bg-pink-600 rounded-md hover:bg-pink-500">
            Skip
          </button>
        </div>

        {/* Search + Guess */}
        <div className="flex gap-2 w-full mb-4">
          <SearchBar
            suggestions={
              (animeList || [])
                .map((anime) => anime?.media?.title?.romaji)
                .filter(Boolean) as string[]
            }
            onChange={(guess) => setCurrentGuess(guess)}
          ></SearchBar>
          <button
            className="px-4 py-2 bg-pink-600 rounded-md hover:bg-pink-500"
            onClick={guess}
          >
            Guess
          </button>
        </div>

        {/* Previous Guesses */}
        <div className="w-full flex flex-col gap-2">
          <div className="bg-gray-700 p-2 rounded-md text-center">
            Isekai Shikkaku
          </div>
          <div className="bg-gray-700 p-2 rounded-md text-center">
            Pocket Monsters
          </div>
          <div className="bg-gray-700 p-2 rounded-md text-center">
            Pocket Monsters
          </div>
          <div className="bg-gray-700 p-2 rounded-md text-center">
            Pocket Monsters
          </div>
          <div className="bg-gray-700 p-2 rounded-md text-center">
            Pocket Monsters
          </div>
        </div>
      </div>
    </div>
  );
}
