import type { AxiosRequestConfig } from 'axios';
import { load, type CheerioAPI, type SelectorType } from 'cheerio';

import { createClient } from '../config/client.js';
import { AniwatchError } from '../config/error.js';
import type { ScrapedEpisodeServers } from '../types/scrapers/index.js';
import { SRC_AJAX_URL, SRC_BASE_URL } from '../utils/index.js';

/**
 * @param {string} episodeId - unique episode id
 * @example
 * import { getEpisodeServers } from "aniwatch";
 *
 * getEpisodeServers("steinsgate-0-92?ep=2055")
 *  .then((data) => console.log(data))
 *  .catch((err) => console.error(err));
 *
 */
export async function getEpisodeServers(
  episodeId: string,
  options: AxiosRequestConfig = {}
): Promise<ScrapedEpisodeServers> {
  const res: ScrapedEpisodeServers = {
    sub: [],
    dub: [],
    raw: [],
    episodeId,
    episodeNo: 0,
  };

  try {
    if (episodeId.trim() === '' || episodeId.indexOf('?ep=') === -1) {
      throw new AniwatchError('invalid anime episode id', getEpisodeServers.name);
    }

    const epId = episodeId.split('?ep=')[1];

    const client = createClient(options);
    const { data } = await client.get(`${SRC_AJAX_URL}/v2/episode/servers?episodeId=${epId}`, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        Referer: new URL(`/watch/${episodeId}`, SRC_BASE_URL).href,
      },
    });

    const $: CheerioAPI = load(data.html);

    const epNoSelector: SelectorType = '.server-notice strong';
    res.episodeNo = Number($(epNoSelector).text().split(' ').pop()) || 0;

    $(`.ps_-block.ps_-block-sub.servers-sub .ps__-list .server-item`).each((_, el) => {
      res.sub.push({
        serverName: $(el).find('a').text().toLowerCase().trim(),
        serverId: Number($(el)?.attr('data-server-id')?.trim()) || null,
      });
    });

    $(`.ps_-block.ps_-block-sub.servers-dub .ps__-list .server-item`).each((_, el) => {
      res.dub.push({
        serverName: $(el).find('a').text().toLowerCase().trim(),
        serverId: Number($(el)?.attr('data-server-id')?.trim()) || null,
      });
    });

    $(`.ps_-block.ps_-block-sub.servers-raw .ps__-list .server-item`).each((_, el) => {
      res.raw.push({
        serverName: $(el).find('a').text().toLowerCase().trim(),
        serverId: Number($(el)?.attr('data-server-id')?.trim()) || null,
      });
    });

    return res;
  } catch (err: any) {
    throw AniwatchError.wrapError(err, getEpisodeServers.name);
  }
}
