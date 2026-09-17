import {
	getCharacter as requestCharacter,
	getCharacters as requestCharacters,
	getEpisode as requestEpisode,
	getEpisodes as requestEpisodes,
} from 'rickmortyapi'

export const API_BASE_URL = 'https://rickandmortyapi.com/api/'
export const API_KEY = ''
export const API_ENDPOINTS = {
	characters: 'character/',
	character: 'character/:id',
	episodes: 'episode/',
	episode: 'episode/:id',
}

// These references document the selected client without starting requests.
void requestCharacters
void requestCharacter
void requestEpisodes
void requestEpisode

export async function fetchCharacters(filters = {}) {
	try {
		// TODO: GET /character/ with page, name, status, species, type and gender.
		void filters
		return { info: { pages: 0, next: null, prev: null }, results: [] }
	} catch (error) {
		console.error('Characters request failed.', error)
		return { info: { pages: 0, next: null, prev: null }, results: [] }
	}
}

export async function fetchCharacter(id) {
	try {
		// TODO: GET /character/:id.
		void id
		return null
	} catch (error) {
		console.error('Character request failed.', error)
		return null
	}
}

export async function fetchEpisodes(filters = {}) {
	try {
		// TODO: GET /episode/ with page and name query parameters.
		void filters
		return { info: { pages: 0, next: null, prev: null }, results: [] }
	} catch (error) {
		console.error('Episodes request failed.', error)
		return { info: { pages: 0, next: null, prev: null }, results: [] }
	}
}

export async function fetchEpisode(id) {
	try {
		// TODO: GET /episode/:id, then request related character URLs.
		void id
		return null
	} catch (error) {
		console.error('Episode request failed.', error)
		return null
	}
}