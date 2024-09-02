import type { CommonAnimeScrapeTypes, ScrapedAnimeCategory } from './animeCategory.js';
import { type ScrapedHomePage } from './homePage.js';

export interface ScrapedGenreAnime
  extends Pick<ScrapedAnimeCategory, CommonAnimeScrapeTypes | 'genres'>,
    Pick<ScrapedHomePage, 'topAiringAnimes'> {
  genreName: string;
}
