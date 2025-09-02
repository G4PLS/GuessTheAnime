import type { Media } from "../anilistTypes";

export default interface GameStateDto {
    attempts: number;
    review: boolean;
    studio: boolean;
    genres: boolean;
    format: boolean;
    release: boolean;
    tags: boolean;
    similar: boolean;
    guessingMedia: {
        id: number,
        media: Media,
        score: number|null,
        scoreFormat: string|null
    }|null;
}