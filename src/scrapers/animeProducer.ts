import type { AxiosRequestConfig } from 'axios';
import { load, type CheerioAPI, type SelectorType } from 'cheerio';

import { createClient } from '../config/client.js';
import { AniwatchError } from '../config/error.js';
import type { ScrapedProducerAnime } from '../types/scrapers/index.js';
import {
  extractAnimes,
  extractMostPopularAnimes,
  extractTop10Animes,
  SRC_BASE_URL,
} from '../utils/index.js';

/**
 * @param {string} producerName - anime producer name
 * @param {number} page - page number, defaults to `1`
 * @param options
 * @example
 * import { getProducerAnimes } from "aniwatch";
 *
 * getProducerAnimes("toei-animation", 2)
 *  .then((data) => console.log(data))
 *  .catch((err) => console.error(err));
 *
 */
export async function getProducerAnimes(
  producerName: string,
  page: number = 1,
  options: AxiosRequestConfig = {}
): Promise<ScrapedProducerAnime> {
  const res: ScrapedProducerAnime = {
    producerName,
    animes: [],
    top10Animes: {
      today: [],
      week: [],
      month: [],
    },
    topAiringAnimes: [],
    totalPages: 1,
    hasNextPage: false,
    currentPage: (Number(page) || 0) < 1 ? 1 : Number(page),
  };

  try {
    if (producerName.trim() === '') {
      throw new AniwatchError('invalid producer name', getProducerAnimes.name);
    }
    page = page < 1 ? 1 : page;

    const producerUrl: URL = new URL(`/producer/${producerName}?page=${page}`, SRC_BASE_URL);

    const client = createClient(options);
    const mainPage = await client.get(producerUrl.href);

    const $: CheerioAPI = load(mainPage.data);

    const animeSelector: SelectorType = '#main-content .tab-content .film_list-wrap .flw-item';

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

    res.animes = extractAnimes($, animeSelector, getProducerAnimes.name);

    if (res.animes.length === 0 && !res.hasNextPage) {
      res.totalPages = 0;
    }

    const producerNameSelector: SelectorType =
      '#main-content .block_area .block_area-header .cat-heading';
    res.producerName = $(producerNameSelector)?.text()?.trim() ?? producerName;

    const top10AnimeSelector: SelectorType =
      '#main-sidebar .block_area-realtime [id^="top-viewed-"]';

    $(top10AnimeSelector).each((_, el) => {
      const period = $(el).attr('id')?.split('-')?.pop()?.trim();

      if (period === 'day') {
        res.top10Animes.today = extractTop10Animes($, period, getProducerAnimes.name);
        return;
      }
      if (period === 'week') {
        res.top10Animes.week = extractTop10Animes($, period, getProducerAnimes.name);
        return;
      }
      if (period === 'month') {
        res.top10Animes.month = extractTop10Animes($, period, getProducerAnimes.name);
      }
    });

    const topAiringSelector: SelectorType =
      '#main-sidebar .block_area_sidebar:nth-child(2) .block_area-content .anif-block-ul ul li';
    res.topAiringAnimes = extractMostPopularAnimes($, topAiringSelector, getProducerAnimes.name);

    return res;
  } catch (err: any) {
    throw AniwatchError.wrapError(err, getProducerAnimes.name);
  }
}
