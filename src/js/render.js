import Handlebars from 'handlebars'
import { dom } from './dom'

Handlebars.registerHelper('fallback', (value, fallbackValue) => value || fallbackValue)

function normalizeCharacter(character = {}) {
	return {
		id: character.id || 0,
		name: character.name || 'Unknown character',
		image: character.image || '',
		status: character.status || 'unknown',
		species: character.species || 'Unknown',
		origin: {
			name: character.origin?.name || 'Unknown origin',
		},
		location: {
			name: character.location?.name || 'Unknown location',
		},
	};
}

function normalizeEpisode(episode = {}) {
	return {
		id: episode.id || 0,
		name: episode.name || 'Unknown title',
		episode: episode.episode || 'N/A',
		air_date: episode.air_date || 'Unknown air date',
	};
}

export const templates = {
	characterCard: Handlebars.compile(dom.characterCardTemplate),
	episode: Handlebars.compile(dom.episodesTemplate),
	episodeModal: Handlebars.compile(dom.episodeModalTemplate),
}

export function renderCharacters(data = [], append = false) {
	if (!dom.charactersList) return;

	const characters = Array.isArray(data) ? data : [];
	const markup = characters
		.map(character => templates.characterCard(normalizeCharacter(character)))
		.join('');

	if (append) {
		dom.charactersList.insertAdjacentHTML('beforeend', markup);
	} else {
		dom.charactersList.innerHTML = markup;
	}
}

export function renderEpisodes(data = [], append = false) {
	if (!dom.episodesList) return;

	const episodes = Array.isArray(data) ? data : [];
	const markup = episodes
		.map(episode => templates.episode(normalizeEpisode(episode)))
		.join('');

	if (append) {
		dom.episodesList.insertAdjacentHTML('beforeend', markup);
	} else {
		dom.episodesList.innerHTML = markup;
	}
}

export function renderCharacterModal(data) {
  if (!data) return '';

  const normalizedCharacter = normalizeCharacter(data);

  const episodeList = Array.isArray(data.episode) ? data.episode.slice(0, 5) : [];

  const modalData = {
    ...normalizedCharacter,
    episodes: episodeList,
  };

  const markup = templates.characterModal
    ? templates.characterModal(modalData)
    : templates.characterCard(modalData);

  if (dom.characterModalRoot) {
    dom.characterModalRoot.innerHTML = markup;
    return dom.characterModalRoot;
  }

  return markup;
}

export function renderEpisodeModal(data) {
  if (!dom.episodeModalRoot || !data) return '';

  const rawCharacters = Array.isArray(data.characters) ? data.characters : [];
  const characters = rawCharacters.map((char) => {
    if (typeof char === 'string') {
      return { name: 'Character', image: '' };
    }
    return {
      id: char.id || 0,
      name: char.name || 'Unknown character',
      image: char.image || '',
    };
  });

  const modalContext = {
    id: data.id || 0,
    title: data.name || data.title || 'Unknown episode',
    name: data.name || 'Unknown episode',
    air_date: data.air_date || 'Unknown air date',
    episode: data.episode || 'N/A',
    characters,
  };

  dom.episodeModalRoot.innerHTML = templates.episodeModal(modalContext);

  return dom.episodeModalRoot;
}