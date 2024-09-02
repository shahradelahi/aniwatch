import type { AxiosRequestConfig } from 'axios';
import { load, type CheerioAPI, type SelectorType } from 'cheerio';

import { createClient } from '../config/client.js';
import { AniwatchError } from '../config/error.js';
import type { FilterKeys, SearchFilters } from '../types/animeSearch.js';
import type { ScrapedAnimeSearchResult } from '../types/scrapers/index.js';
import {
  extractAnimes,
  extractMostPopularAnimes,
  getSearchDateFilterValue,
  getSearchFilterValue,
  SRC_SEARCH_URL,
} from '../utils/index.js';

const searchFilters: Record<string, boolean> = {
  filter: true,
  type: true,
  status: true,
  rated: true,
  score: true,
  season: true,
  language: true,
  start_date: true,
  end_date: true,
  sort: true,
  genres: true,
} as const;

async function _getAnimeSearchResults(
  q: string,
  page: number = 1,
  filters: SearchFilters,
  options: AxiosRequestConfig = {}
): Promise<ScrapedAnimeSearchResult> {
  try {
    const res: ScrapedAnimeSearchResult = {
      animes: [],
      mostPopularAnimes: [],
      searchQuery: q,
      searchFilters: filters,
      totalPages: 1,
      hasNextPage: false,
      currentPage: (Number(page) || 0) < 1 ? 1 : Number(page),
    };

    const url = new URL(SRC_SEARCH_URL);
    url.searchParams.set('keyword', q);
    url.searchParams.set('page', `${page}`);
    url.searchParams.set('sort', 'default');

    for (const key in filters) {
      if (key.includes('_date')) {
        const dates = getSearchDateFilterValue(
          key === 'start_date',
          filters[key as keyof SearchFilters] || ''
        );
        if (!dates) continue;

        dates.map((dateParam) => {
          const [key, val] = dateParam.split('=');
          url.searchParams.set(key, val);
        });
        continue;
      }

      const filterVal = getSearchFilterValue(
        key as FilterKeys,
        filters[key as keyof SearchFilters] || ''
      );
      filterVal && url.searchParams.set(key, filterVal);
    }

    const client = createClient(options);
    const mainPage = await client.get(url.href);

    const $: CheerioAPI = load(mainPage.data);

    const selector: SelectorType = '#main-content .tab-content .film_list-wrap .flw-item';

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

    res.animes = extractAnimes($, selector, getAnimeSearchResults.name);

    if (res.animes.length === 0 && !res.hasNextPage) {
      res.totalPages = 0;
    }

    const mostPopularSelector: SelectorType =
      '#main-sidebar .block_area.block_area_sidebar.block_area-realtime .anif-block-ul ul li';
    res.mostPopularAnimes = extractMostPopularAnimes(
      $,
      mostPopularSelector,
      getAnimeSearchResults.name
    );

    return res;
  } catch (err: any) {
    throw AniwatchError.wrapError(err, getAnimeSearchResults.name);
  }
}

/**
 * @param {string} q - search query
 * @param {number} page - page number, defaults to `1`
 * @param {SearchFilters} filters - optional advance search filters
 * @example
 * import { getAnimeSearchResults } from "aniwatch";
 *
 *  getAnimeSearchResults("monster", 1, {
 *    genres: "seinen,psychological",
 *  })
 *    .then((data) => {
 *      console.log(data);
 *    })
 *    .catch((err) => {
 *      console.error(err);
 *    });
 *
 */
export async function getAnimeSearchResults(
  q: string,
  page: number = 1,
  filters: SearchFilters = {}
): Promise<ScrapedAnimeSearchResult> {
  try {
    q = q.trim() ? decodeURIComponent(q.trim()) : '';
    if (q.trim() === '') {
      throw new AniwatchError('invalid search query', getAnimeSearchResults.name);
    }
    page = page < 1 ? 1 : page;

    const parsedFilters: SearchFilters = {};
    for (const key in filters) {
      if (searchFilters[key]) {
        parsedFilters[key as keyof SearchFilters] = filters[key as keyof SearchFilters];
      }
    }

    return _getAnimeSearchResults(q, page, parsedFilters);
  } catch (err: any) {
    throw AniwatchError.wrapError(err, getAnimeSearchResults.name);
  }
}
