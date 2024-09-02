import crypto from 'crypto';
import axios from 'axios';

import { AniwatchError } from '../config/error.js';

// https://megacloud.tv/embed-2/e-1/dBqCr5BcOhnD?k=1

const megacloud = {
  script: 'https://megacloud.tv/js/player/a/prod/e1-player.min.js?v=',
  sources: 'https://megacloud.tv/embed-2/ajax/e-1/getSources?id=',
} as const;

type track = {
  file: string;
  kind: string;
  label?: string;
  default?: boolean;
};

type intro_outro = {
  start: number;
  end: number;
};

type unencryptedSrc = {
  file: string;
  type: string;
};

type extractedSrc = {
  sources: string | unencryptedSrc[];
  tracks: track[];
  encrypted: boolean;
  intro: intro_outro;
  outro: intro_outro;
  server: number;
};

interface ExtractedData extends Pick<extractedSrc, 'intro' | 'outro' | 'tracks'> {
  sources: { url: string; type: string }[];
}

class MegaCloud {
  // private serverName = "megacloud";

  async extract(videoUrl: URL) {
    try {
      const extractedData: ExtractedData = {
        tracks: [],
        intro: {
          start: 0,
          end: 0,
        },
        outro: {
          start: 0,
          end: 0,
        },
        sources: [],
      };

      const videoId = videoUrl?.href?.split('/')?.pop()?.split('?')[0];
      const { data: srcsData } = await axios.get<extractedSrc>(
        megacloud.sources.concat(videoId || ''),
        {
          headers: {
            Accept: '*/*',
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            Referer: videoUrl.href,
          },
        }
      );
      if (!srcsData) {
        throw new AniwatchError('Url may have an invalid video id', 'getAnimeEpisodeSources');
      }

      // console.log(JSON.stringify(srcsData, null, 2));

      const encryptedString = srcsData.sources;
      if (!srcsData.encrypted && Array.isArray(encryptedString)) {
        extractedData.intro = srcsData.intro;
        extractedData.outro = srcsData.outro;
        extractedData.tracks = srcsData.tracks;
        extractedData.sources = encryptedString.map((s) => ({
          url: s.file,
          type: s.type,
        }));

        return extractedData;
      }

      let text: string;
      const { data } = await axios.get(megacloud.script.concat(Date.now().toString()));

      text = data;
      if (!text) {
        throw new AniwatchError(
          "Couldn't fetch script to decrypt resource",
          'getAnimeEpisodeSources'
        );
      }

      const vars = this.extractVariables(text);
      if (!vars.length) {
        throw new Error("Can't find variables. Perhaps the extractor is outdated.");
      }

      const { secret, encryptedSource } = this.getSecret(encryptedString as string, vars);
      const decrypted = this.decrypt(encryptedSource, secret);
      try {
        const sources = JSON.parse(decrypted);
        extractedData.intro = srcsData.intro;
        extractedData.outro = srcsData.outro;
        extractedData.tracks = srcsData.tracks;
        extractedData.sources = sources.map((s: any) => ({
          url: s.file,
          type: s.type,
        }));

        return extractedData;
      } catch (error) {
        throw new AniwatchError('Failed to decrypt resource', 'getAnimeEpisodeSources');
      }
    } catch (err) {
      // console.log(err);
      throw err;
    }
  }

  extractVariables(text: string) {
    // copied from github issue #30 'https://github.com/ghoshRitesh12/aniwatch-api/issues/30'
    const regex = /case\s*0x[0-9a-f]+:(?![^;]*=partKey)\s*\w+\s*=\s*(\w+)\s*,\s*\w+\s*=\s*(\w+);/g;
    const matches = text.matchAll(regex);
    const vars = Array.from(matches, (match) => {
      const matchKey1 = this.matchingKey(match[1], text);
      const matchKey2 = this.matchingKey(match[2], text);
      try {
        return [parseInt(matchKey1, 16), parseInt(matchKey2, 16)];
      } catch (e) {
        return [];
      }
    }).filter((pair) => pair.length > 0);

    return vars;
  }

  getSecret(encryptedString: string, values: number[][]) {
    let secret = '',
      encryptedSource = '',
      encryptedSourceArray = encryptedString.split(''),
      currentIndex = 0;

    for (const index of values) {
      const start = index[0] + currentIndex;
      const end = start + index[1];

      for (let i = start; i < end; i++) {
        secret += encryptedString[i];
        encryptedSourceArray[i] = '';
      }
      currentIndex += index[1];
    }

    encryptedSource = encryptedSourceArray.join('');

    return { secret, encryptedSource };
  }

  decrypt(encrypted: string, keyOrSecret: string, maybe_iv?: string) {
    let key;
    let iv;
    let contents;
    if (maybe_iv) {
      key = keyOrSecret;
      iv = maybe_iv;
      contents = encrypted;
    } else {
      // copied from 'https://github.com/brix/crypto-js/issues/468'
      const cypher = Buffer.from(encrypted, 'base64');
      const salt = cypher.subarray(8, 16);
      const password = Buffer.concat([Buffer.from(keyOrSecret, 'binary'), salt]);
      const md5Hashes = [];
      let digest = password;
      for (let i = 0; i < 3; i++) {
        md5Hashes[i] = crypto.createHash('md5').update(digest).digest();
        digest = Buffer.concat([md5Hashes[i], password]);
      }
      key = Buffer.concat([md5Hashes[0], md5Hashes[1]]);
      iv = md5Hashes[2];
      contents = cypher.subarray(16);
    }

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const decrypted =
      decipher.update(
        contents as any,
        typeof contents === 'string' ? 'base64' : undefined,
        'utf8'
      ) + decipher.final();

    return decrypted;
  }

  // function copied from github issue #30 'https://github.com/ghoshRitesh12/aniwatch-api/issues/30'
  matchingKey(value: string, script: string) {
    const regex = new RegExp(`,${value}=((?:0x)?([0-9a-fA-F]+))`);
    const match = script.match(regex);
    if (match) {
      return match[1].replace(/^0x/, '');
    } else {
      throw new Error('Failed to match the key');
    }
  }
}

export default MegaCloud;
