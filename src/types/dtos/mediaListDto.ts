import type { Media } from "../anilistTypes";

export interface MediaListDto {
    id: number;
    listName: string;
    entries: {
        id: number;
        media: Media;
        score: number|null;
        scoreFormat: string|null;
    }[]
}