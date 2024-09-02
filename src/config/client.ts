import axios, { AxiosError, type AxiosRequestConfig } from 'axios';

import { ACCEPT_ENCODING_HEADER, ACCEPT_HEADER, USER_AGENT_HEADER } from '../utils/constants.js';

export function createClient(config: AxiosRequestConfig = {}) {
  return axios.create({
    timeout: 8000,
    ...config,
    // baseURL: SRC_BASE_URL,
    headers: {
      ...config.headers,
      Accept: ACCEPT_HEADER,
      'User-Agent': USER_AGENT_HEADER,
      'Accept-Encoding': ACCEPT_ENCODING_HEADER,
    },
  });
}

export { AxiosError };
