import type { Media } from "../anilistTypes";

export interface GuessedMediaDto {
    id: number;
    attempts: number;
    correct: boolean;
    mediaList: {
        id: number;
        listName: string;
    };
    mediaEntry: {
        id: number;
        media: Media;
        score: number|null;
        scoreFormat: string|null;
    }
}