import {
	getCharacter as requestCharacter,
	getCharacters as requestCharacters,
	getEpisode as requestEpisode,
	getEpisodes as requestEpisodes,
} from 'rickmortyapi'

const DEFAULT_LIST_FALLBACK = {
	info: { pages: 0, next: null, prev: null, count: 0 },
	results: [],
};

function buildApiFilters(obj) {
	const normalizeObj = {};
	for (const [key, value] of Object.entries(obj)) {
		let normalizedValue = typeof value === 'string' ? value.trim() : value;
		if (key == null || normalizedValue == null || normalizedValue === "any" || normalizedValue === '' || normalizedValue === "all") {
			continue;
		}
		if (key === "page") {
			const pageNum = Number(value);
			normalizedValue = (!pageNum || pageNum < 1) ? 1 : pageNum;
		}
		normalizeObj[key] = normalizedValue;
	}
	return normalizeObj;
}

function validateId(id) {
	const numericId = Number(id);
	if (!Number.isNaN(numericId) && numericId > 0) {
		return numericId;
	}
	throw new Error("id is not a number");
}

export async function fetchCharacters(filters = {}) {
	try {
		const cleanFilters = buildApiFilters(filters);
		const response = await requestCharacters(cleanFilters);
		if (response.status === 200 && response.data) {
			return {
				info: {
					pages: response.data.info?.pages || 0,
					next: response.data.info?.next || null,
					prev: response.data.info?.prev || null,
					count: response.data.info?.count || 0,
				},
				results: Array.isArray(response.data.results) ? response.data.results : [],
			};
		}
		return DEFAULT_LIST_FALLBACK
	} catch (error) {
		console.error('Characters request failed.', error)
		return DEFAULT_LIST_FALLBACK
	}
}

export async function fetchCharacter(id) {
	try {
		const cleanId = validateId(id);
		const response = await requestCharacter(cleanId);
		if (response.status === 200 && response.data) {
			const data = response.data;
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
		}
	} catch (error) {
		console.error('Character request failed.', error)
		return null
	}
}

export async function fetchEpisodes(filters = {}) {
	try {
		const cleanFilters = buildApiFilters(filters);
		const response = await requestEpisodes(cleanFilters);
		if (response.status === 200 && response.data) {
			return {
				info: {
					pages: response.data.info?.pages || 0,
					next: response.data.info?.next || null,
					prev: response.data.info?.prev || null,
					count: response.data.info?.count || 0,
				},
				results: Array.isArray(response.data.results) ? response.data.results : [],
			};
		}
		return DEFAULT_LIST_FALLBACK
	} catch (error) {
		console.error('Episodes request failed.', error)
		return DEFAULT_LIST_FALLBACK
	}
}

export async function fetchEpisode(id) {
	try {
		const cleanId = validateId(id);
		const response = await requestEpisode(cleanId);
		if (response.status === 200 && response.data) {
			const data = response.data;
			return {
				id: data.id,
				name: data.name || '',
				episode: data.episode || '',
				air_date: data.air_date || '',
				characters: Array.isArray(data.characters) ? data.characters : [],
			};
		}
	} catch (error) {
		console.error('Episode request failed.', error)
		return null
	}
}

export async function fetchCharactersByUrls(urls = []) {
  if (!Array.isArray(urls) || urls.length === 0) return [];

  const ids = urls
    .map((url) => Number(url.split('/').pop()))
    .filter((id) => !Number.isNaN(id) && id > 0);

  if (ids.length === 0) return [];

  try {
    const response = await requestCharacter(ids);
    if (response.status !== 200 || !response.data) return [];

    return Array.isArray(response.data) ? response.data : [response.data];
  } catch (error) {
    console.error('Failed to fetch characters by URLs', error);
    return [];
  }
}