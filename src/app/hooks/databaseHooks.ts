import { useLiveQuery } from "dexie-react-hooks";
import {
  db,
  type GameRecord,
  type Guess,
  type GuessHistoryRecord,
  type MediaListRecord,
  type MediaRecord,
  type SettingsRecord,
} from "../../lib/database";

export function useCurrentSettings(): SettingsRecord | undefined {
  return useLiveQuery(() => db.settings.get("current"), []);
}

// STATE HOOKS
export function useCurrentGame(): GameRecord | undefined {
  return useLiveQuery(() => db.game.get("current"), []);
}

/**
 * Converts state media Id to actual media
 */
export function useCurrentMedia(): MediaRecord | undefined {
  const game = useCurrentGame();
  return useLiveQuery(() => {
    if (!game?.state?.currentMediaId) return undefined;
    return db.media.get(game.state.currentMediaId);
  }, [game?.state?.currentMediaId]);
}

export function useCurrentGuess(): Guess | undefined {
  const game = useCurrentGame();

  return useLiveQuery(() => {
    if (!game?.state?.guesses.length || 0 <= 0) return undefined;
    return game.state.guesses[game.state.guesses.length - 1];
  }, [game?.state?.guesses]);
}

export function useMediaLists(): MediaListRecord[] | undefined {
  return useLiveQuery(() => db.mediaLists.toArray(), []);
}

export function useMedia(): MediaRecord[] | undefined {
  return useLiveQuery(() => db.media.toArray(), []);
}

export function useMediaListEntries(
  listName: string
): MediaRecord[] | undefined {
  return useLiveQuery(
    () =>
      db.mediaListEntries
        .where("listName")
        .equals(listName)
        .toArray()
        .then(async (entries) => {
          const media = await db.media.bulkGet(entries.map((e) => e.mediaId));
          return media as MediaRecord[];
        }),
    [listName]
  );
}

export function useGuessHistory(): GuessHistoryRecord[] | undefined {
  return useLiveQuery(
    () => db.guessHistory.orderBy("completedAt").reverse().toArray(),
    []
  );
}

export function useGameRunning(): boolean|undefined {
  return useLiveQuery(() => db.isGameRunning(), [])
}

export function useMediaById(id?: number): MediaRecord | undefined {
  return useLiveQuery(() => (id ? db.media.get(id) : undefined), [id]);
}

export function useListsForMedia(mediaId: number): string[] | undefined {
  return useLiveQuery(
    () =>
      db.mediaListEntries
        .where("mediaId")
        .equals(mediaId)
        .toArray()
        .then((entries) => entries.map((e) => e.listName)),
    [mediaId]
  );
}

export function useMediaForSelectedLists(): MediaRecord[] | undefined {
  return useLiveQuery(async () => {
    const settings = await db.settings.get("current");
    if (!settings) return undefined;

    const selectedLists = settings.selectedListNames;
    if (selectedLists.length === 0) return [];

    // Get all entries for the selected lists
    const entries = await db.mediaListEntries
      .where("listName")
      .anyOf(selectedLists)
      .toArray();

    if (entries.length === 0) return [];

    // Fetch all media by their IDs
    const media = await db.media.bulkGet(entries.map((e) => e.mediaId));

    // We assume all IDs exist, so assert type
    return media as MediaRecord[];
  }, []); // no extra deps; reactivity handled by liveQuery
}

export function useRemainingMedia(): MediaRecord[] | undefined {
  return useLiveQuery(async () => {
    // 1️⃣ Get current settings
    const game = await db.game.get("current");

    if (!game) return undefined;

    const selectedLists = game.selectedListNames;

    if (selectedLists.length === 0) return [];

    // 2️⃣ Get all media entries in the selected lists
    const entries = await db.mediaListEntries
      .where("listName")
      .anyOf(selectedLists)
      .toArray();
    if (entries.length === 0) return [];

    const allMedia = await db.media.bulkGet(entries.map((e) => e.mediaId));
    const mediaRecords = allMedia as MediaRecord[]; // assume all exist

    // 3️⃣ Get current guesses from the game
    const guessedIds = game?.state?.guesses.map((g) => g.mediaId) ?? [];

    // 4️⃣ Filter out already guessed media
    const remaining = mediaRecords.filter((m) => !guessedIds.includes(m.id!));

    return remaining;
  }, []); // dependencies handled by liveQuery: changes to settings, game, mediaListEntries, or media
}
