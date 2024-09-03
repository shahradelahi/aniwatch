import { AxiosRequestConfig } from 'axios';

interface Anime {
    id: string | null;
    name: string | null;
    jname: string | null;
    poster: string | null;
    duration: string | null;
    type: string | null;
    rating: string | null;
    episodes: {
        sub: number | null;
        dub: number | null;
    };
}
type CommonAnimeProps = 'id' | 'name' | 'poster';
interface Top10Anime extends Pick<Anime, CommonAnimeProps | 'episodes'> {
    rank: number | null;
    jname: string | null;
}
type Top10AnimeTimePeriod = 'day' | 'week' | 'month';
interface MostPopularAnime extends Pick<Anime, CommonAnimeProps | 'episodes' | 'type'> {
    jname: string | null;
}
interface SpotlightAnime extends MostPopularAnime, Pick<Top10Anime, 'rank'> {
    description: string | null;
    otherInfo: string[];
}
interface TrendingAnime extends Pick<Anime, CommonAnimeProps | 'jname'>, Pick<Top10Anime, 'rank'> {
}
interface LatestEpisodeAnime extends Anime {
}
interface TopUpcomingAnime extends Anime {
}
interface TopAiringAnime extends MostPopularAnime {
}
interface MostFavoriteAnime extends MostPopularAnime {
}
interface LatestCompletedAnime extends MostPopularAnime {
}
interface AnimeGeneralAboutInfo extends Pick<Anime, CommonAnimeProps>, Pick<SpotlightAnime, 'description'> {
    anilistId: number | null;
    malId: number | null;
    stats: {
        quality: string | null;
    } & Pick<Anime, 'duration' | 'episodes' | 'rating' | 'type'>;
    promotionalVideos: AnimePromotionalVideo[];
    charactersVoiceActors: AnimeCharactersAndVoiceActors[];
}
interface RecommendedAnime extends Anime {
}
interface RelatedAnime extends MostPopularAnime {
}
interface Season extends Pick<Anime, CommonAnimeProps> {
    isCurrent: boolean;
    title: string | null;
}
interface AnimePromotionalVideo {
    title: string | undefined;
    source: string | undefined;
    thumbnail: string | undefined;
}
interface AnimeCharactersAndVoiceActors {
    character: AnimeCharacter;
    voiceActor: AnimeCharacter;
}
interface AnimeCharacter {
    id: string;
    poster: string;
    name: string;
    cast: string;
}
interface AnimeSearchSuggestion extends Omit<MostPopularAnime, 'episodes' | 'type'> {
    moreInfo: Array<string>;
}
interface AnimeEpisode extends Pick<Season, 'title'> {
    episodeId: string | null;
    number: number;
    isFiller: boolean;
}
interface SubEpisode {
    serverName: string;
    serverId: number | null;
}
interface DubEpisode extends SubEpisode {
}
interface RawEpisode extends SubEpisode {
}
type AnimeCategories = 'most-favorite' | 'most-popular' | 'subbed-anime' | 'dubbed-anime' | 'recently-updated' | 'recently-added' | 'top-upcoming' | 'top-airing' | 'movie' | 'special' | 'ova' | 'ona' | 'tv' | 'completed';
type AnimeServers = 'hd-1' | 'hd-2' | 'megacloud' | 'streamsb' | 'streamtape';
declare enum Servers {
    VidStreaming = "hd-1",
    MegaCloud = "megacloud",
    StreamSB = "streamsb",
    StreamTape = "streamtape",
    VidCloud = "hd-2",
    AsianLoad = "asianload",
    GogoCDN = "gogocdn",
    MixDrop = "mixdrop",
    UpCloud = "upcloud",
    VizCloud = "vizcloud",
    MyCloud = "mycloud",
    Filemoon = "filemoon"
}

type AnimeSearchQueryParams = {
    q?: string;
    page?: string;
    type?: string;
    status?: string;
    rated?: string;
    score?: string;
    season?: string;
    language?: string;
    start_date?: string;
    end_date?: string;
    sort?: string;
    genres?: string;
};
type SearchFilters = Omit<AnimeSearchQueryParams, 'q' | 'page'>;
type FilterKeys = Partial<keyof Omit<SearchFilters, 'start_date' | 'end_date'>>;

interface ScrapedAnimeCategory {
    animes: Array<Anime>;
    genres: Array<string>;
    top10Animes: {
        today: Array<Top10Anime>;
        week: Array<Top10Anime>;
        month: Array<Top10Anime>;
    };
    category: string;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
}
type CommonAnimeScrapeTypes = 'animes' | 'totalPages' | 'hasNextPage' | 'currentPage';

interface ScrapedAnimeSearchResult extends Pick<ScrapedAnimeCategory, CommonAnimeScrapeTypes> {
    mostPopularAnimes: Array<MostPopularAnime>;
    searchQuery: string;
    searchFilters: SearchFilters;
}

interface ScrapedAnimeAboutInfo extends Pick<ScrapedAnimeSearchResult, 'mostPopularAnimes'> {
    anime: {
        info: AnimeGeneralAboutInfo;
        moreInfo: Record<string, string | string[]>;
    };
    seasons: Array<Season>;
    relatedAnimes: Array<RelatedAnime>;
    recommendedAnimes: Array<RecommendedAnime>;
}

interface ScrapedAnimeEpisodes {
    totalEpisodes: number;
    episodes: Array<AnimeEpisode>;
}

interface Video {
    url: string;
    quality?: string;
    isM3U8?: boolean;
    size?: number;
    [x: string]: unknown;
}
interface Subtitle {
    id?: string;
    url: string;
    lang: string;
}
interface Intro {
    start: number;
    end: number;
}

interface ScrapedAnimeEpisodesSources {
    headers?: {
        [k: string]: string;
    };
    intro?: Intro;
    subtitles?: Subtitle[];
    sources: Video[];
    download?: string;
    embedURL?: string;
}

interface ScrapedHomePage extends Pick<ScrapedAnimeCategory, 'genres' | 'top10Animes'> {
    spotlightAnimes: Array<SpotlightAnime>;
    trendingAnimes: Array<TrendingAnime>;
    latestEpisodeAnimes: Array<LatestEpisodeAnime>;
    topUpcomingAnimes: Array<TopUpcomingAnime>;
    topAiringAnimes: Array<TopAiringAnime>;
    mostPopularAnimes: Array<MostPopularAnime>;
    mostFavoriteAnimes: Array<MostFavoriteAnime>;
    latestCompletedAnimes: Array<LatestCompletedAnime>;
}

interface ScrapedGenreAnime extends Pick<ScrapedAnimeCategory, CommonAnimeScrapeTypes | 'genres'>, Pick<ScrapedHomePage, 'topAiringAnimes'> {
    genreName: string;
}

interface ScrapedProducerAnime extends Omit<ScrapedAnimeCategory, 'genres' | 'category'>, Pick<ScrapedHomePage, 'topAiringAnimes'> {
    producerName: string;
}

interface ScrapedAnimeSearchSuggestion {
    suggestions: Array<AnimeSearchSuggestion>;
}

interface ScrapedEpisodeServers {
    sub: SubEpisode[];
    dub: DubEpisode[];
    raw: RawEpisode[];
    episodeNo: number;
    episodeId: string;
}

type EstimatedSchedule = {
    id: string | null;
    time: string | null;
    name: string | null;
    jname: string | null;
    airingTimestamp: number;
    secondsUntilAiring: number;
    episode: number;
};
type ScrapedEstimatedSchedule = {
    scheduledAnimes: Array<EstimatedSchedule>;
};

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
declare function getAnimeAboutInfo(animeId: string, options?: AxiosRequestConfig): Promise<ScrapedAnimeAboutInfo>;

/**
 * @param {string} category - anime category
 * @param {number} page - page number, defaults to `1`
 * @param options
 * @example
 * import { getAnimeCategory } from "aniwatch";
 *
 * getAnimeCategory("subbed-anime")
 *  .then((data) => console.log(data))
 *  .catch((err) => console.error(err));
 *
 */
declare function getAnimeCategory(category: AnimeCategories, page?: number, options?: AxiosRequestConfig): Promise<ScrapedAnimeCategory>;

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
declare function getAnimeEpisodes(animeId: string, options?: AxiosRequestConfig): Promise<ScrapedAnimeEpisodes>;

type AnilistID = number | null;
type MalID = number | null;
/**
 * @param {string} episodeId - unique episode id
 * @example
 * import { getAnimeEpisodeSources } from "aniwatch";
 *
 * getAnimeEpisodeSources("steinsgate-3?ep=230", "hd-1", "sub")
 *  .then((data) => console.log(data))
 *  .catch((err) => console.error(err));
 *
 */
declare function getAnimeEpisodeSources(episodeId: string, server?: AnimeServers, category?: 'sub' | 'dub' | 'raw'): Promise<ScrapedAnimeEpisodesSources & {
    anilistID: AnilistID;
    malID: MalID;
}>;

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
declare function getGenreAnime(genreName: string, page?: number, options?: AxiosRequestConfig): Promise<ScrapedGenreAnime>;

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
declare function getProducerAnimes(producerName: string, page?: number, options?: AxiosRequestConfig): Promise<ScrapedProducerAnime>;

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
declare function getAnimeSearchResults(q: string, page?: number, filters?: SearchFilters): Promise<ScrapedAnimeSearchResult>;

/**
 * @param {string} q - search query
 * @param options
 * @example
 * import { getAnimeSearchSuggestion } from "aniwatch";
 *
 * getAnimeSearchSuggestion("one piece")
 *  .then((data) => console.log(data))
 *  .catch((err) => console.error(err));
 *
 */
declare function getAnimeSearchSuggestion(q: string, options?: AxiosRequestConfig): Promise<ScrapedAnimeSearchSuggestion>;

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
declare function getEpisodeServers(episodeId: string, options?: AxiosRequestConfig): Promise<ScrapedEpisodeServers>;

/**
 * @param {string} date - date in `YYYY-MM-DD` format
 * @example
 * import { getEstimatedSchedule } from "aniwatch";
 *
 * getEstimatedSchedule("2024-08-09")
 *  .then((data) => console.log(data))
 *  .catch((err) => console.error(err));
 *
 */
declare function getEstimatedSchedule(date: string, options?: AxiosRequestConfig): Promise<ScrapedEstimatedSchedule>;

/**
 * @example
 * import { getHomePage } from "aniwatch";
 *
 * getHomePage()
 *  .then((data) => console.log(data))
 *  .catch((err) => console.error(err));
 *
 */
declare function getHomePage(options?: AxiosRequestConfig): Promise<ScrapedHomePage>;

declare class AniwatchError extends Error {
    scraper: string;
    constructor(errMsg: string, scraperName: string);
    static wrapError(err: AniwatchError | any, scraperName: string): AniwatchError;
    private logError;
}

export { type Anime, type AnimeCategories, type AnimeCharacter, type AnimeCharactersAndVoiceActors, type AnimeEpisode, type AnimeGeneralAboutInfo, type AnimePromotionalVideo, type AnimeSearchQueryParams, type AnimeSearchSuggestion, type AnimeServers, AniwatchError, type DubEpisode, type FilterKeys, type LatestCompletedAnime, type LatestEpisodeAnime, type MostFavoriteAnime, type MostPopularAnime, type RawEpisode, type RecommendedAnime, type RelatedAnime, type ScrapedAnimeAboutInfo, type ScrapedAnimeCategory, type ScrapedAnimeEpisodes, type ScrapedAnimeEpisodesSources, type ScrapedAnimeSearchResult, type ScrapedAnimeSearchSuggestion, type ScrapedEpisodeServers, type ScrapedEstimatedSchedule, type ScrapedGenreAnime, type ScrapedHomePage, type ScrapedProducerAnime, type SearchFilters, type Season, Servers, type SpotlightAnime, type SubEpisode, type Top10Anime, type Top10AnimeTimePeriod, type TopAiringAnime, type TopUpcomingAnime, type TrendingAnime, getAnimeAboutInfo, getAnimeCategory, getAnimeEpisodeSources, getAnimeEpisodes, getAnimeSearchResults, getAnimeSearchSuggestion, getEpisodeServers, getEstimatedSchedule, getGenreAnime, getHomePage, getProducerAnimes };
