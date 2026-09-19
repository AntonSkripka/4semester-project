const BASE_URL = 'https://rickandmortyapi.com/api';

const DEFAULT_LIST_FALLBACK = {
  info: { pages: 0, next: null, prev: null, count: 0 },
  results: [],
};

function buildQueryString(filters = {}) {
  if (!filters || typeof filters !== 'object') return '';
  
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null) continue;

    const normalized = typeof value === 'string' ? value.trim() : value;
    if (normalized === '' || normalized === 'any' || normalized === 'all') continue;

    if (key === 'page') {
      const pageNum = Number(value);
      params.append('page', !pageNum || pageNum < 1 ? 1 : pageNum);
    } else {
      params.append(key, normalized);
    }
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

function validateId(id) {
  const numericId = Number(id);
  if (!Number.isNaN(numericId) && numericId > 0) {
    return numericId;
  }
  throw new Error('id is not a number');
}

export async function fetchCharacters(filters = {}) {
  try {
    const query = buildQueryString(filters);
    const response = await fetch(`${BASE_URL}/character${query}`);
    if (!response.ok) return DEFAULT_LIST_FALLBACK;

    const data = await response.json();
    return {
      info: {
        pages: data.info?.pages || 0,
        next: data.info?.next || null,
        prev: data.info?.prev || null,
        count: data.info?.count || 0,
      },
      results: Array.isArray(data.results) ? data.results : [],
    };
  } catch (error) {
    console.error('Characters request failed.', error);
    return DEFAULT_LIST_FALLBACK;
  }
}

export async function fetchCharacter(id) {
  try {
    const cleanId = validateId(id);
    const response = await fetch(`${BASE_URL}/character/${cleanId}`);
    if (!response.ok) return null;

    const data = await response.json();
    return {
      id: data.id,
      name: data.name || '',
      status: data.status || 'unknown',
      species: data.species || '',
      type: data.type || '',
      gender: data.gender || 'unknown',
      origin: data.origin || null,
      location: data.location || null,
      image: data.image || null,
      episode: Array.isArray(data.episode) ? data.episode : [],
    };
  } catch (error) {
    console.error('Character request failed.', error);
    return null;
  }
}

export async function fetchEpisodes(filters = {}) {
  try {
    const query = buildQueryString(filters);
    const response = await fetch(`${BASE_URL}/episode${query}`);
    if (!response.ok) return DEFAULT_LIST_FALLBACK;

    const data = await response.json();
    return {
      info: {
        pages: data.info?.pages || 0,
        next: data.info?.next || null,
        prev: data.info?.prev || null,
        count: data.info?.count || 0,
      },
      results: Array.isArray(data.results) ? data.results : [],
    };
  } catch (error) {
    console.error('Episodes request failed.', error);
    return DEFAULT_LIST_FALLBACK;
  }
}

export async function fetchEpisode(id) {
  try {
    const cleanId = validateId(id);
    const response = await fetch(`${BASE_URL}/episode/${cleanId}`);
    if (!response.ok) return null;

    const data = await response.json();
    return {
      id: data.id,
      name: data.name || '',
      episode: data.episode || '',
      air_date: data.air_date || '',
      characters: Array.isArray(data.characters) ? data.characters : [],
    };
  } catch (error) {
    console.error('Episode request failed.', error);
    return null;
  }
}

export const fetchEpisodeById = fetchEpisode;

export async function fetchCharactersByUrls(urls = []) {
  if (!Array.isArray(urls) || urls.length === 0) return [];

  const ids = urls
    .map((url) => Number(url.split('/').pop()))
    .filter((id) => !Number.isNaN(id) && id > 0);

  if (ids.length === 0) return [];

  try {
    const response = await fetch(`${BASE_URL}/character/${ids.join(',')}`);
    if (!response.ok) return [];

    const data = await response.json();
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error('Failed to fetch characters by URLs', error);
    return [];
  }
}