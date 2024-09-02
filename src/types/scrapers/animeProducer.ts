import type { ScrapedAnimeCategory } from './animeCategory.js';
import type { ScrapedHomePage } from './homePage.js';

export interface ScrapedProducerAnime
  extends Omit<ScrapedAnimeCategory, 'genres' | 'category'>,
    Pick<ScrapedHomePage, 'topAiringAnimes'> {
  producerName: string;
}
