import type { AxiosRequestConfig } from 'axios';
import { load, type CheerioAPI, type SelectorType } from 'cheerio';

import { createClient } from '../config/client.js';
import { AniwatchError } from '../config/error.js';
import type { ScrapedGenreAnime } from '../types/scrapers/index.js';
import { extractAnimes, extractMostPopularAnimes, SRC_BASE_URL } from '../utils/index.js';

/**
 * @param {string} genreName - anime genre name
 * @param {number} page - page number, defaults to `1`
 * @param options
 * @example
 * import { getGenreAnime } from "aniwatch";
 *
 * getGenreAnime("shounen", 2)
 *  .then((data) => console.log(data))
 *  .catch((err) => console.error(err));
 *
 */
export async function getGenreAnime(
  genreName: string,
  page: number = 1,
  options: AxiosRequestConfig = {}
): Promise<ScrapedGenreAnime> {
  const res: ScrapedGenreAnime = {
    genreName,
    animes: [],
    genres: [],
    topAiringAnimes: [],
    totalPages: 1,
    hasNextPage: false,
    currentPage: (Number(page) || 0) < 1 ? 1 : Number(page),
  };

  // there's a typo with zoro where martial arts is marial arts
  genreName = genreName === 'martial-arts' ? 'marial-arts' : genreName;

  try {
    if (genreName.trim() === '') {
      throw new AniwatchError('invalid genre name', getGenreAnime.name);
    }
    page = page < 1 ? 1 : page;

    const genreUrl: URL = new URL(`/genre/${genreName}?page=${page}`, SRC_BASE_URL);

    const client = createClient(options);
    const mainPage = await client.get(genreUrl.href);
    const $: CheerioAPI = load(mainPage.data);

    const selector: SelectorType = '#main-content .tab-content .film_list-wrap .flw-item';

    const genreNameSelector: SelectorType =
      '#main-content .block_area .block_area-header .cat-heading';
    res.genreName = $(genreNameSelector)?.text()?.trim() ?? genreName;

    res.hasNextPage =
      $('.pagination > li').length > 0
        ? $('.pagination li.active').length > 0
          ? $('.pagination > li').last().hasClass('active')
            ? false
            : true
          : false
        : false;

    res.totalPages =
      Number(
        $('.pagination > .page-item a[title="Last"]')?.attr('href')?.split('=').pop() ??
          $('.pagination > .page-item a[title="Next"]')?.attr('href')?.split('=').pop() ??
          $('.pagination > .page-item.active a')?.text()?.trim()
      ) || 1;

    res.animes = extractAnimes($, selector, getGenreAnime.name);

    if (res.animes.length === 0 && !res.hasNextPage) {
      res.totalPages = 0;
    }

    const genreSelector: SelectorType =
      '#main-sidebar .block_area.block_area_sidebar.block_area-genres .sb-genre-list li';
    $(genreSelector).each((_, el) => {
      res.genres.push(`${$(el).text().trim()}`);
    });

    const topAiringSelector: SelectorType =
      '#main-sidebar .block_area.block_area_sidebar.block_area-realtime .anif-block-ul ul li';
    res.topAiringAnimes = extractMostPopularAnimes($, topAiringSelector, getGenreAnime.name);

    return res;
  } catch (err: any) {
    throw AniwatchError.wrapError(err, getGenreAnime.name);
  }
}
