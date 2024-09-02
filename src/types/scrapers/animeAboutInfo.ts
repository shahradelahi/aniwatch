import type { AnimeGeneralAboutInfo, RecommendedAnime, RelatedAnime, Season } from '../anime.js';
import { type ScrapedAnimeSearchResult } from './animeSearch.js';

export interface ScrapedAnimeAboutInfo extends Pick<ScrapedAnimeSearchResult, 'mostPopularAnimes'> {
  anime: {
    info: AnimeGeneralAboutInfo;
    moreInfo: Record<string, string | string[]>;
  };
  seasons: Array<Season>;
  relatedAnimes: Array<RelatedAnime>;
  recommendedAnimes: Array<RecommendedAnime>;
}
