import axios from 'axios';
import axiosThrottle from 'axios-request-throttle';
import { GraphQLClient } from 'graphql-request';
import throttle from 'fetch-throttle';

export const serverApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
});

export const skyMavisApi = axios.create({
  baseURL: '/api/game/',
  timeout: 1000 * 15, // 15 seconds
});

export const axieInfinityGraphQl = new GraphQLClient('https://axieinfinity.com/graphql-server-v2/graphql', {
  fetch: throttle(fetch, 3, 1000),
  timeout: 1000 * 15, // 15 seconds
});

axiosThrottle.use(skyMavisApi, { requestsPerSecond: 100 });
axiosThrottle.use(serverApi, { requestsPerSecond: 50 });
