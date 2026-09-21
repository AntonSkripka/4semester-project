const BASE_URL = 'https://rickandmortyapi.com/api';

const DEFAULT_PAGE = 1;
const EMPTY_LIST_INFO = { pages: 0, next: null, prev: null, count: 0 };

function createEmptyListResponse() {
  return {
    info: { ...EMPTY_LIST_INFO },
    results: [],
  };
}

function buildQueryString(filters = {}) {
  if (!filters || typeof filters !== 'object') return '';
  
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null) continue;

    const normalized = typeof value === 'string' ? value.trim() : value;
    if (normalized === '' || normalized === 'any' || normalized === 'all') continue;

    if (key === 'page') {
      const pageNum = Number(value);
      params.append('page', !pageNum || pageNum < 1 ? DEFAULT_PAGE : pageNum);
    } else {
      params.append(key, normalized);
    }
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

function getListResponse(data) {
  return {
    info: {
      pages: data.info?.pages || 0,
      next: data.info?.next || null,
      prev: data.info?.prev || null,
      count: data.info?.count || 0,
    },
    results: Array.isArray(data.results) ? data.results : [],
  };
}

async function requestJson(endpoint) {
  const response = await fetch(`${BASE_URL}/${endpoint}`);
  if (!response.ok) return null;
  return response.json();
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
    const data = await requestJson(`character${query}`);
    return data ? getListResponse(data) : createEmptyListResponse();
  } catch (error) {
    return createEmptyListResponse();
  }
}

export async function fetchCharacter(id) {
  try {
    const cleanId = validateId(id);
    const data = await requestJson(`character/${cleanId}`);
    if (!data) return null;

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
    return null;
  }
}

export async function fetchEpisodes(filters = {}) {
  try {
    const query = buildQueryString(filters);
    const data = await requestJson(`episode${query}`);
    return data ? getListResponse(data) : createEmptyListResponse();
  } catch (error) {
    return createEmptyListResponse();
  }
}

export async function fetchEpisode(id) {
  try {
    const cleanId = validateId(id);
    const data = await requestJson(`episode/${cleanId}`);
    if (!data) return null;

    return {
      id: data.id,
      name: data.name || '',
      episode: data.episode || '',
      air_date: data.air_date || '',
      characters: Array.isArray(data.characters) ? data.characters : [],
    };
  } catch (error) {
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
    const data = await requestJson(`character/${ids.join(',')}`);
    if (!data) return [];

    return Array.isArray(data) ? data : [data];
  } catch (error) {
    return [];
  }
}