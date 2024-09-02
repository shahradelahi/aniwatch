import { expect, test } from 'vitest';

import { getHomePage } from '../src/index.js';

test('returns anime information present in homepage', async () => {
  const data = await getHomePage();

  expect(data.spotlightAnimes).not.toEqual([]);
  expect(data.trendingAnimes).not.toEqual([]);
  expect(data.latestEpisodeAnimes).not.toEqual([]);
  expect(data.topUpcomingAnimes).not.toEqual([]);
  expect(data.topAiringAnimes).not.toEqual([]);
  expect(data.mostPopularAnimes).not.toEqual([]);
  expect(data.mostFavoriteAnimes).not.toEqual([]);
  expect(data.latestCompletedAnimes).not.toEqual([]);
  expect(data.genres).not.toEqual([]);

  expect(data.top10Animes.today).not.toEqual([]);
  expect(data.top10Animes.week).not.toEqual([]);
  expect(data.top10Animes.month).not.toEqual([]);

  console.log(data.spotlightAnimes[0]);
});
