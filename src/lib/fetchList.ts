import { type MediaListCollectionResponse } from "@/types/anilistTypes";

const API_URL = "https://graphql.anilist.co";
const MEDIA_LIST_COLLECTION_QUERY = `query MediaListCollection($userName: String) {
  MediaListCollection(userName: $userName, type: ANIME) {
    lists {
      name
      entries {
        media {
          title {
            english
            romaji
            native
          }
          format
          seasonYear
          season
          description
          genres
          episodes
          averageScore
          popularity
          tags {
            name
            description
            rank
          }
          reviews(sort: RATING) {
            nodes {
              summary
              score
            }
          }
          studios(isMain: true) {
            edges {
              isMain
              node {
                id
                name
              }
            }
          }
          coverImage {
            large
          }
          recommendations(sort: RATING_DESC){
            nodes {
              mediaRecommendation {
                coverImage {
                  medium
                }
                siteUrl
                title {
                  english
                  native
                  romaji
                }
              }
            }
          }
          meanScore
          siteUrl
        }
        score
        user {
          mediaListOptions {
            scoreFormat
          }
        }
      }
    }
  }
}`

export async function fetchList(username: string): Promise<MediaListCollectionResponse|null> {
    const variables = {userName: username};

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({query:MEDIA_LIST_COLLECTION_QUERY, variables})
        });

        if (!response.ok) {
            throw new Error("GraphQL Request failed" + response.bodyUsed);
        }

        const data = await response.json();
        return data.data as MediaListCollectionResponse;
    } catch(error) {
        console.error("Error fetching medialist: ", error);
        return null;
    }
}