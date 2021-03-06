import axios from 'axios';

import { cache } from '@src/services/cache';
import dayjs from '@src/services/dayjs';

interface ApiScholarAdventureResponse {
  gained_slp_response: {
    gained_slp: number;
    max_slp: number;
  };
}

export interface ScholarAdventureData {
  slp: number;
  maxSlp: number;
}

export const getScholarAdventure = async (address: string): Promise<ScholarAdventureData> => {
  const day = dayjs().day();
  const cacheKey = `v1:scholarAdventure:${address}:${day}`;
  const cacheTime = 1000 * 60 * 15; // 15 minutes
  const apiUrl = `https://game-api.skymavis.com/game-api/clients/${address}/pve-best-scores/worlds/1/pve-stats`;
  const apiParams = {
    offset: 0,
    limit: 0,
  };

  const cached = await cache.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const { data } = await axios.get<ApiScholarAdventureResponse>(apiUrl, { params: apiParams });

  const scholarPvp = {
    slp: data.gained_slp_response.gained_slp,
    maxSlp: data.gained_slp_response.max_slp,
  };

  await cache.set(cacheKey, JSON.stringify(scholarPvp), 'PX', cacheTime);
  return scholarPvp;
};
