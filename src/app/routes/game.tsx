import SearchBar from "@/components/GuessField/GuessField";
import {
  db,
  type GameRecord,
  type Guess,
  type Hints,
  type MediaRecord
} from "@/lib/database";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCurrentGame,
  useCurrentMedia,
  useGuessHistory,
  useRemainingMedia
} from "../hooks/databaseHooks";

export default function Game() {
  const navigate = useNavigate();

  const game = useCurrentGame(); // CURRENT GAME
  const currentMedia = useCurrentMedia(); // CURRENT MEDIA THATS BEING GUESSED (COMES FROM GAMESTATE)
  const currentHints = game?.state?.currentHints; // CURRENT HINTS ACTIVE IN THE STATE
  const animeList = useRemainingMedia(); // CURRENT WHEN ANYTHING RELATED TO GUESSING CHANGES

  const [currentGuess, setCurrentGuess] = useState<string>(""); // WHAT THE USER INPUTS IN THE GUESS FIELD

  const guessed = useGuessHistory()?.length||0;

  const MAX_ATTEMPTS = Object.entries(game?.selectedHints || {}).filter(
    ([_, enabled]) => enabled
  ).length;

  async function guess() {
    if (!currentMedia || !game) return;

    const attemptsSoFar = game.state!.guesses.length;
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

    const updatedGuesses = [...game.state!.guesses, newGuess];

    // Determine if round is over
    const roundOver = newGuess.correct || updatedGuesses.length > MAX_ATTEMPTS;

    // Start with a copy of currentHints
    let newHints = { ...game.state!.currentHints };

    if (!roundOver) {
      // Pick a random hint from selectedHints that hasn't been revealed yet
      const availableHints = Object.entries(game.selectedHints)
        .filter(([_, enabled]) => enabled) // only enabled hints
        .map(([hintKey]) => hintKey as keyof Hints) // cast to keyof Hints
        .filter((hintKey) => newHints[hintKey] !== true); // only not revealed

      if (availableHints.length > 0) {
        const randomHintKey = availableHints[
          Math.floor(Math.random() * availableHints.length)
        ] as keyof Hints;
        newHints = {
          ...newHints,
          [randomHintKey]: true,
        };
      }

      // Just update guesses and hints
      await db.game.update("current", {
        state: {
          ...game.state!,
          guesses: updatedGuesses,
          currentHints: newHints,
        },
      });
    } else {
      // Save current guesses to history
      await db.guessHistory.add({
        guesses: updatedGuesses,
        mediaId: currentMedia.id!,
        completedAt: new Date(),
        revealedHints: game.state!.currentHints,
      });

      const nextMedia = await pickRandom(game);

      // Reset game state for next round
      await db.game.update("current", {
        state: {
          currentMediaId: nextMedia?.id ?? 0,
          guesses: [],
          currentHints: {},
        },
      });
    }
  }

  async function pickRandom(game: GameRecord): Promise<MediaRecord|null> {
    // Pick next media
    const allowedEntries = await db.mediaListEntries
      .where("listName")
      .anyOf(game.selectedListNames)
      .toArray();

    const guessHistory = await db.guessHistory.toArray();

    const allowedIds = allowedEntries.map((entry) => entry.mediaId);

    const guessedMediaIds = guessHistory.map((guess) => guess.mediaId);

    const remainingIds = allowedIds.filter(id =>
      !guessedMediaIds.includes(id)
    );

    const remaining = await db.media.where("id").anyOf(remainingIds).toArray();

    console.log("ALLOWED", allowedIds, "GUESSED", guessedMediaIds, "REMAINING", remainingIds);

    const nextMedia = remaining.length
      ? remaining[Math.floor(Math.random() * remaining.length)]
      : null;

    return nextMedia;
  }

  useEffect(() => {
    const init = async () => {
      const settings = await db.settings.get("current");
      let game = await db.game.get("current");

      if (!settings) {
        navigate("/login");
        return;
      }

      if (!game) {
        await db.game.put(
          {
            id: "current",
            selectedHints: settings.selectedHints,
            selectedListNames: settings.selectedListNames,
            state: {
              currentHints: {},
              guesses: [],
              currentMediaId: -1,
            },
          },
          "current"
        );
        game = await db.game.get("current");
      }

      if (!game) {
        navigate("/login");
        return;
      }

      if (!game.state || game.state.currentMediaId === -1) {
        const allMedia = await db.media.toArray();
        if (allMedia.length === 0) return;

        const randomMedia = await pickRandom(game);

        if (!randomMedia) {
          navigate("/login")
          return;
        }

        await db.game.put({
          id: "current",
          selectedHints: settings.selectedHints,
          selectedListNames: settings.selectedListNames,
          state: {
            currentMediaId: randomMedia.id!,
            guesses: [],
            currentHints: {
              description: false,
              format: false,
              genres: false,
              popularity: false,
              rating: false,
              recommendations: false,
              review: false,
              season: false,
              studios: false,
              tags: false,
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
      <h2>
        {guessed}/{animeList?.length||0} {currentMedia &&
          (currentMedia.media.title.english || currentMedia.media.title.romaji)}
      </h2>
      <div className="grid grid-cols-2 gap-4 bg-gray-800 p-4 rounded-xl w-4/6 h-4/6 min-h-0 overflow-auto">
        {/* Left Column */}
        <div className="flex flex-col gap-4 min-h-0">
          {/* Review + Description */}
          <div className="flex flex-row gap-4 flex-9 min-h-0">
            {/* Review */}
            <div className="bg-gray-700 p-3 rounded-lg flex-1 min-w-0 flex flex-col">
              <h2 className="font-bold">REVIEW</h2>
              <p className="flex-1 text-sm overflow-auto min-h-0">
                {currentHints?.review &&
                  (currentMedia?.media.reviews.nodes.length || 0) > 0 &&
                  currentMedia?.media.reviews.nodes[0].summary}
              </p>
            </div>

            {/* Description */}
            <div className="bg-gray-700 p-3 rounded-lg flex-1 min-w-0 flex flex-col">
              <h2 className="font-bold">DESCRIPTION</h2>
              <p className="flex-1 text-sm overflow-auto min-h-0">
                {currentHints?.description && currentMedia?.media.description}
              </p>
            </div>
          </div>

          {/* Season + Format */}
          <div className="grid grid-cols-2 gap-2 flex-1 min-w-0">
            <div className="bg-gray-700 p-2 rounded-lg text-center">
              <h3 className="font-bold">SEASON</h3>
              <p className="text-sm">
                {currentHints?.season &&
                  `${currentMedia?.media.season} ${currentMedia?.media.seasonYear}`}
              </p>
            </div>
            <div className="bg-gray-700 p-2 rounded-lg text-center">
              <h3 className="font-bold">FORMAT</h3>
              <p className="text-sm">
                {currentHints?.format &&
                  `${currentMedia?.media.format} (${currentMedia?.media.episodes} Episodes)`}
              </p>
            </div>
          </div>

          {/* Rating + Popularity */}
          <div className="grid grid-cols-2 gap-2 flex-1 min-w-0">
            <div className="bg-gray-700 p-2 rounded-lg text-center">
              <h3 className="font-bold">RATING</h3>
              <p className="text-sm">
                {currentHints?.rating &&
                  `Mean: ${currentMedia?.media.meanScore} Avg: ${currentMedia?.media.averageScore} User: ${currentMedia?.score}`}
              </p>
            </div>
            <div className="bg-gray-700 p-2 rounded-lg text-center">
              <h3 className="font-bold">POPULARITY</h3>
              <p className="text-sm">
                {currentHints?.popularity && currentMedia?.media.popularity}
              </p>
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
                {currentHints?.tags &&
                  currentMedia?.media.tags
                    .sort((a, b) => (b.rank || 0) - (a.rank || 0))
                    .map((tag) => (
                      <p key={tag.name} className="text-sm">
                        {tag.name} {tag.rank}
                      </p>
                    ))}
              </div>
            </div>

            {/* Genres */}
            <div className="bg-gray-700 p-3 rounded-lg flex-1 min-w-0 flex flex-col">
              <h2 className="font-bold mb-2">Genres</h2>
              <div className="flex-1 overflow-auto min-h-0">
                {currentHints?.genres &&
                  currentMedia?.media.genres.map((genre) => (
                    <p key={genre} className="text-sm">
                      {genre}
                    </p>
                  ))}
              </div>
            </div>

            {/* Studios */}
            <div className="bg-gray-700 p-3 rounded-lg flex-1 min-w-0 flex flex-col">
              <h2 className="font-bold mb-2">Studios</h2>
              <div className="flex-1 overflow-auto min-h-0">
                {currentHints?.studios &&
                  currentMedia?.media.studios.edges
                    .sort((a, b) => Number(b.isMain) - Number(a.isMain))
                    .map((studio) => (
                      <p key={studio.node.id} className="text-sm">
                        {studio.node.name}
                      </p>
                    ))}
              </div>
            </div>
          </div>

          {/* Similar */}
          <div className="bg-gray-700 p-3 rounded-lg flex-1 min-w-0 flex flex-col">
            <h2 className="font-bold mb-2">SIMILAR</h2>
            <div className="flex-1 flex flex-grow gap-2 overflow-x-auto">
              {currentHints?.recommendations &&
                currentMedia?.media.recommendations.nodes.map((recomm) => (
                  <img
                    className="h-full bg-gray-600"
                    title={recomm.mediaRecommendation.title.english || ""}
                    src={recomm.mediaRecommendation.coverImage.medium || ""}
                    alt={recomm.mediaRecommendation.title.romaji || ""}
                  ></img>
                ))}
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
      </div>
    </div>
  );
}
