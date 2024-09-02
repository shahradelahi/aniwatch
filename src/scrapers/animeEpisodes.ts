import type { AxiosRequestConfig } from 'axios';
import { load, type CheerioAPI } from 'cheerio';

import { createClient } from '../config/client.js';
import { AniwatchError } from '../config/error.js';
import type { ScrapedAnimeEpisodes } from '../types/scrapers/index.js';
import { SRC_AJAX_URL, SRC_BASE_URL } from '../utils/index.js';

/**
 * @param {string} animeId - unique anime id
 * @param options
 * @example
 * import { getAnimeEpisodes } from "aniwatch";
 *
 * getAnimeEpisodes("attack-on-titan-112")
 *  .then((data) => console.log(data))
 *  .catch((err) => console.error(err));
 *
 */
export async function getAnimeEpisodes(
  animeId: string,
  options: AxiosRequestConfig = {}
): Promise<ScrapedAnimeEpisodes> {
  const res: ScrapedAnimeEpisodes = {
    totalEpisodes: 0,
    episodes: [],
  };

  try {
    if (animeId.trim() === '' || animeId.indexOf('-') === -1) {
      throw new AniwatchError('invalid anime id', getAnimeEpisodes.name);
    }

    const client = createClient(options);

    const episodesAjax = await client.get(
      `${SRC_AJAX_URL}/v2/episode/list/${animeId.split('-').pop()}`,
      {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          Referer: `${SRC_BASE_URL}/watch/${animeId}`,
        },
      }
    );

    const $: CheerioAPI = load(episodesAjax.data.html);

    res.totalEpisodes = Number($('.detail-infor-content .ss-list a').length);

    $('.detail-infor-content .ss-list a').each((_, el) => {
      res.episodes.push({
        title: $(el)?.attr('title')?.trim() || null,
        episodeId: $(el)?.attr('href')?.split('/')?.pop() || null,
        number: Number($(el).attr('data-number')),
        isFiller: $(el).hasClass('ssl-item-filler'),
      });
    });

    return res;
  } catch (err: any) {
    throw AniwatchError.wrapError(err, getAnimeEpisodes.name);
  }
}
