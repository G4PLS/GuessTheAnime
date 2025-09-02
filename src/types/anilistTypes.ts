export interface MediaListCollectionResponse {
  MediaListCollection: {
    lists: MediaList[];
  } | null;
}

export interface MediaList {
  name: string; // Name of the list (Completed, Watching, Custom List Name)
  entries: MediaListEntry[];
}

export interface MediaListEntry {
  media: Media; // Actual Anime
  score: number | null; // User-given score
  user: {
    mediaListOptions: {
      scoreFormat: string | null;
    };
  };
}

export interface Media {
  title: {
    english: string | null;
    romaji: string | null;
    native: string | null;
  };
  coverImage: {
    large: string | null;
  };
  siteUrl: string | null;
  format: string | null;
  season: string | null;
  seasonYear: number | null;
  episodes: number | null;
  description: string | null;
  genres: string[];
  meanScore: number | null;
  averageScore: number | null;
  popularity: number | null;
  tags: Tag[];
  reviews: {
    nodes: Review[];
  };
  studios: {
    edges: StudioEdge[];
  };
  recommendations: {
    nodes: RecommendationNode[];
  };
}

export interface Tag {
  name: string;
  description: string | null;
  rank: number | null;
}

export interface Review {
  summary: string | null;
  score: number | null;
}

export interface StudioEdge {
  isMain: boolean;
  node: {
    id: number;
    name: string;
  };
}

export interface RecommendationNode {
  mediaRecommendation: {
    title: {
      english: string | null;
      romaji: string | null;
      native: string | null;
    };
    coverImage: {
      medium: string | null;
    };
    siteUrl: string | null;
  };
}
