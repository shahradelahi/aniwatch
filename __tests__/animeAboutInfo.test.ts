import { expect, test } from 'vitest';

import { getAnimeAboutInfo } from '../src/index.js';

test('returns information about an anime', async () => {
  // const data = await getAnimeAboutInfo('steinsgate-3');
  const data = await getAnimeAboutInfo('spy-x-family-code-white-19291');

  expect(data.anime.info.name).not.toEqual(null);
  expect(data.recommendedAnimes).not.toEqual([]);
  // expect(data.mostPopularAnimes).not.toEqual([]);
  expect(Object.keys(data.anime.moreInfo)).not.toEqual([]);

  console.log(JSON.stringify(data, null, 2));
});
