import type { DubEpisode, RawEpisode, SubEpisode } from '../anime.js';

export interface ScrapedEpisodeServers {
  sub: SubEpisode[];
  dub: DubEpisode[];
  raw: RawEpisode[];
  episodeNo: number;
  episodeId: string;
}
