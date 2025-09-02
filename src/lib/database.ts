import type { Media, MediaListCollectionResponse } from "@/types/anilistTypes";
import Dexie, { type Table } from "dexie";

// HELPER TABLES

export interface Guess {
  attempt: number;
  mediaId: number;
  guessedMediaName: string;
  correct: boolean | null;
}

export interface Hints {
  season: boolean; // season | seasonYear
  format: boolean; // episodes | format
  studios: boolean; // studios
  rating: boolean; // meanScore | averageScore | user Score
  popularity: boolean; // popularity
  genres: boolean; // genres
  tags: boolean; // tags
  review: boolean; // review
  recommendations: boolean; //recommendations
  description: boolean; //descrition
}

export interface GameState {
  currentMediaId: number;
  guesses: Guess[];
  currentHints: Partial<Hints>; // Current hint states
  selectedHints: Partial<Hints>; // Hints that are actually being used
  selectedListNames: string[] // List names that are actually being used
}

// DATABASE TABLES

export interface SettingsRecord {
  id: "current"; //PK
  anlistUsername: string;
  selectedListNames: string[];
  selectedHints: Partial<Hints>;
}

export interface GameRecord {
  id: "current"; //PK
  state: GameState | null;
}

export interface MediaListRecord {
  listName: string; //PK
  totalEntries: number;
}

export interface MediaRecord {
  id?: number; //PK
  media: Media;
  score: number | null;
  scoreFormat: string | null;
}

export interface MediaListEntryRecord {
  listName: string; //FK->MediaListRecord
  mediaId: number; //FK->MediaRecord
}

export interface GuessHistoryRecord {
  id?: number; //PK
  mediaId: number; //FK->MediaRecord;
  guesses: Guess[];
  completedAt: Date;
}

export class AnilistDB extends Dexie {
  // TABLES
  settings!: Table<SettingsRecord, "current">;
  game!: Table<GameRecord, "current">;
  mediaLists!: Table<MediaListRecord, string>; // PK = listName
  media!: Table<MediaRecord, number>;
  mediaListEntries!: Table<MediaListEntryRecord, [string, number]>; // composite key optional
  guessHistory!: Table<GuessHistoryRecord, number>;

  constructor() {
    super("AnilistDB");

    this.version(1).stores({
      settings: "id", // singleton
      game: "id", // singleton
      mediaLists: "listName", // queryable by name
      media: "++id", // auto-increment + optional index
      mediaListEntries: "[listName+mediaId], listName, mediaId", // composite + secondary
      guessHistory: "++id, completedAt", // auto-increment + index for sorting
    });
  }

  async clearDatabase() {
    await this.transaction(
      "rw",
      [
        this.settings,
        this.game,
        this.media,
        this.mediaLists,
        this.mediaListEntries,
        this.guessHistory,
      ],
      async () => {
        await Promise.all([
          this.settings.clear(),
          this.game.clear(),
          this.media.clear(),
          this.mediaLists.clear(),
          this.mediaListEntries.clear(),
          this.guessHistory.clear(),
        ]);
      }
    );
  }

  async resetDatabase() {
    await db.delete();
    await db.open();
  }

  async createFromMediaListCollectionResponse(
    username: string,
    response: MediaListCollectionResponse
  ) {
    if (!response.MediaListCollection) return;

    // Reset DB
    await Promise.all([
      this.game.clear(),
      this.media.clear(),
      this.mediaLists.clear(),
      this.mediaListEntries.clear(),
      this.guessHistory.clear(),
    ]);

    await this.transaction(
      "rw",
      [
        this.settings,
        this.mediaLists,
        this.media,
        this.mediaListEntries,
        this.game,
      ],
      async () => {
        const settings = await this.settings.get("current");

        // 1️⃣ Create/update user settings
        await this.settings.put({
          id: "current",
          anlistUsername: username,
          selectedListNames: [],
          selectedHints: settings?.selectedHints ?? {},
        });

        // 2️⃣ Create/update singleton game with empty state
        await this.game.put({
          id: "current",
          state: null,
        });

        // 3️⃣ Add lists and media
        for (const list of response.MediaListCollection!.lists) {
          // Add the media list row
          await this.mediaLists.put({
            listName: list.name,
            totalEntries: list.entries.length,
          });

          // Add media entries and join table rows
          for (const entry of list.entries) {
            const mediaId = await this.media.add({
              media: entry.media,
              score: entry.score,
              scoreFormat: entry.user.mediaListOptions.scoreFormat,
            });

            await this.mediaListEntries.put({
              listName: list.name,
              mediaId,
            });
          }
        }
      }
    );
  }
}

export const db = new AnilistDB();
