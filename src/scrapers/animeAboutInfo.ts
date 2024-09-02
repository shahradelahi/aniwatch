import type { AxiosRequestConfig } from 'axios';
import { load, type CheerioAPI, type SelectorType } from 'cheerio';

import { createClient } from '../config/client.js';
import { AniwatchError } from '../config/error.js';
import type { ScrapedAnimeAboutInfo } from '../types/scrapers/index.js';
import { extractAnimes, extractMostPopularAnimes, SRC_BASE_URL } from '../utils/index.js';

/**
 * @param {string} animeId - unique anime id
 * @example
 * import { getAnimeAboutInfo } from "aniwatch";
 *
 * getAnimeAboutInfo("steinsgate-3")
 *  .then((data) => console.log(data))
 *  .catch((err) => console.error(err));
 *
 */
export async function getAnimeAboutInfo(
  animeId: string,
  options: AxiosRequestConfig = {}
): Promise<ScrapedAnimeAboutInfo> {
  const res: ScrapedAnimeAboutInfo = {
    anime: {
      info: {
        id: null,
        anilistId: null,
        malId: null,
        name: null,
        poster: null,
        description: null,
        stats: {
          rating: null,
          quality: null,
          episodes: {
            sub: null,
            dub: null,
          },
          type: null,
          duration: null,
        },
        promotionalVideos: [],
        charactersVoiceActors: [],
      },
      moreInfo: {},
    },
    seasons: [],
    mostPopularAnimes: [],
    relatedAnimes: [],
    recommendedAnimes: [],
  };

  try {
    if (animeId.trim() === '' || animeId.indexOf('-') === -1) {
      throw new AniwatchError('invalid anime id', getAnimeAboutInfo.name);
    }

    const animeUrl: URL = new URL(animeId, SRC_BASE_URL);
    const client = createClient(options);
    const mainPage = await client.get(animeUrl.href);

    const $: CheerioAPI = load(mainPage.data);

    try {
      const syncData = JSON.parse($('body')?.find('#syncData')?.text());
      res.anime.info.anilistId = syncData?.anilist_id ? Number(syncData?.anilist_id) : null;
      res.anime.info.malId = syncData?.anilist_id ? Number(syncData?.malId) : null;
    } catch (err) {
      res.anime.info.anilistId = null;
      res.anime.info.malId = null;
    }

    const selector: SelectorType = '#ani_detail .container .anis-content';

    res.anime.info.id =
      $(selector)
        ?.find('.anisc-detail .film-buttons a.btn-play')
        ?.attr('href')
        ?.split('/')
        ?.pop() || null;
    res.anime.info.name =
      $(selector)?.find('.anisc-detail .film-name.dynamic-name')?.text()?.trim() || null;
    res.anime.info.description =
      $(selector)
        ?.find('.anisc-detail .film-description .text')
        .text()
        ?.split('[')
        ?.shift()
        ?.trim() || null;
    res.anime.info.poster =
      $(selector)?.find('.film-poster .film-poster-img')?.attr('src')?.trim() || null;

    // stats
    res.anime.info.stats.rating =
      $(`${selector} .film-stats .tick .tick-pg`)?.text()?.trim() || null;
    res.anime.info.stats.quality =
      $(`${selector} .film-stats .tick .tick-quality`)?.text()?.trim() || null;
    res.anime.info.stats.episodes = {
      sub: Number($(`${selector} .film-stats .tick .tick-sub`)?.text()?.trim()) || null,
      dub: Number($(`${selector} .film-stats .tick .tick-dub`)?.text()?.trim()) || null,
    };

    res.anime.info.stats.type =
      $(`${selector} .film-stats .tick`)
        ?.text()
        ?.trim()
        ?.match(/(TV|OVA|Movie|ONA|Special)/g)?.[0] || null;

    res.anime.info.stats.duration =
      $(`${selector} .film-stats .tick`)
        ?.text()
        ?.trim()
        ?.match(/((:?[0-9]{0,2}h )?[0-9]{0,2}m)/g)?.[0] || null;

    // get promotional videos
    $('.block_area.block_area-promotions .block_area-promotions-list .screen-items .item').each(
      (_, el) => {
        res.anime.info.promotionalVideos.push({
          title: $(el).attr('data-title'),
          source: $(el).attr('data-src'),
          thumbnail: $(el).find('img').attr('src'),
        });
      }
    );

    // get characters and voice actors
    $('.block_area.block_area-actors .block-actors-content .bac-list-wrap .bac-item').each(
      (_, el) => {
        res.anime.info.charactersVoiceActors.push({
          character: {
            id: $(el).find($('.per-info.ltr .pi-avatar')).attr('href')?.split('/')[2] || '',
            poster: $(el).find($('.per-info.ltr .pi-avatar img')).attr('data-src') || '',
            name: $(el).find($('.per-info.ltr .pi-detail a')).text(),
            cast: $(el).find($('.per-info.ltr .pi-detail .pi-cast')).text(),
          },
          voiceActor: {
            id: $(el).find($('.per-info.rtl .pi-avatar')).attr('href')?.split('/')[2] || '',
            poster: $(el).find($('.per-info.rtl .pi-avatar img')).attr('data-src') || '',
            name: $(el).find($('.per-info.rtl .pi-detail a')).text(),
            cast: $(el).find($('.per-info.rtl .pi-detail .pi-cast')).text(),
          },
        });
      }
    );

    // more information
    $(`${selector} .anisc-info-wrap .anisc-info .item:not(.w-hide)`).each((_, el) => {
      let key = $(el).find('.item-head').text().toLowerCase().replace(':', '').trim();
      key = key.includes(' ') ? key.replace(' ', '') : key;

      const value = [
        ...$(el)
          .find('*:not(.item-head)')
          .map((_, el) => $(el).text().trim()),
      ]
        .map((i) => `${i}`)
        .toString()
        .trim();

      if (['studios', 'genres', 'producers'].includes(key)) {
        res.anime.moreInfo[key] = value.split(',').map((i) => i.trim());
        return;
      }

      res.anime.moreInfo[key] = value;
    });

    // more seasons
    const seasonsSelector: SelectorType = '#main-content .os-list a.os-item';
    $(seasonsSelector).each((_, el) => {
      res.seasons.push({
        id: $(el)?.attr('href')?.slice(1)?.trim() || null,
        name: $(el)?.attr('title')?.trim() || null,
        title: $(el)?.find('.title')?.text()?.trim(),
        poster:
          $(el)
            ?.find('.season-poster')
            ?.attr('style')
            ?.split(' ')
            ?.pop()
            ?.split('(')
            ?.pop()
            ?.split(')')[0] || null,
        isCurrent: $(el).hasClass('active'),
      });
    });

    const relatedAnimeSelector: SelectorType =
      '#main-sidebar .block_area.block_area_sidebar.block_area-realtime:nth-of-type(1) .anif-block-ul ul li';
    res.relatedAnimes = extractMostPopularAnimes($, relatedAnimeSelector, getAnimeAboutInfo.name);

    const mostPopularSelector: SelectorType =
      '#main-sidebar .block_area.block_area_sidebar.block_area-realtime:nth-of-type(2) .anif-block-ul ul li';
    res.mostPopularAnimes = extractMostPopularAnimes(
      $,
      mostPopularSelector,
      getAnimeAboutInfo.name
    );

    const recommendedAnimeSelector: SelectorType =
      '#main-content .block_area.block_area_category .tab-content .flw-item';
    res.recommendedAnimes = extractAnimes($, recommendedAnimeSelector, getAnimeAboutInfo.name);

    return res;
  } catch (err: any) {
    throw AniwatchError.wrapError(err, getAnimeAboutInfo.name);
  }
}
