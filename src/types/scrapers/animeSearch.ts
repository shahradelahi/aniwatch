import type { MostPopularAnime } from '../anime.js';
import type { SearchFilters } from '../animeSearch.js';
import type { CommonAnimeScrapeTypes, ScrapedAnimeCategory } from './animeCategory.js';

export interface ScrapedAnimeSearchResult
  extends Pick<ScrapedAnimeCategory, CommonAnimeScrapeTypes> {
  mostPopularAnimes: Array<MostPopularAnime>;
  searchQuery: string;
  searchFilters: SearchFilters;
}
