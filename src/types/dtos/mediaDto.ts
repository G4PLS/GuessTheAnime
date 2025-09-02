import type { Media } from "../anilistTypes";

export interface MediaDto {
    id: number;
    mediaList: {
        id: number;
        listName: string;
    }
    media: Media;
    score: number|null;
    scoreFormat: string|null;
}