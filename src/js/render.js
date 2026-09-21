import Handlebars from 'handlebars'
import { dom } from './dom'

const backgroundImageUrl = new URL('../images/background-1x.png', import.meta.url).href

Handlebars.registerHelper('fallback', (value, fallbackValue) => value || fallbackValue)

Handlebars.registerHelper('highlightName', (name, query) => {
	const text = String(name || '');
	const search = String(query || '').trim();

	if (!search) return Handlebars.escapeExpression(text);

	const escapedQuery = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const highlighted = Handlebars.escapeExpression(text).replace(
		new RegExp(`(${escapedQuery})`, 'gi'),
		'<mark>$1</mark>',
	);

	return new Handlebars.SafeString(highlighted);
})

function normalizeCharacter(character = {}) {
	const originName = typeof character.origin === 'string'
		? character.origin
		: character.origin?.name;
	const locationName = typeof character.location === 'string'
		? character.location
		: character.location?.name;

	return {
		id: character.id || 0,
		name: character.name || 'Unknown character',
		image: character.image || backgroundImageUrl,
		status: character.status || 'unknown',
		species: character.species || 'Unknown',
		type: character.type?.trim() || 'Not specified',
		gender: character.gender || 'unknown',
		origin: { name: originName || 'Unknown origin' },
		location: { name: locationName || 'Unknown location' },
	};
}

function normalizeEpisode(episode = {}) {
	const episodeCode = episode.episode || 'N/A';
	const seasonMatch = episodeCode.match(/^S(\d+)/i);

	return {
		id: episode.id || 0,
		name: episode.name || 'Unknown title',
		episode: episodeCode,
		season: seasonMatch ? seasonMatch[1] : 'N/A',
		airDate: episode.air_date || 'Unknown air date',
		air_date: episode.air_date || 'Unknown air date',
	};
}

function renderCollection({ container, emptyState, data, append, renderItem }) {
	if (!container) return;

	const items = Array.isArray(data) ? data : [];
	if (!append) {
		container.innerHTML = '';
	}
	if (emptyState) {
		emptyState.hidden = items.length > 0 || append;
	}
	if (items.length === 0) return;

	const markup = items.map(renderItem).join('');
	if (append) {
		container.insertAdjacentHTML('beforeend', markup);
		return;
	}

	container.innerHTML = markup;
}

export const templates = {
	characterCard: Handlebars.compile(dom.characterCardTemplate),
	characterModal: Handlebars.compile(dom.characterModalTemplate),
	episode: Handlebars.compile(dom.episodesTemplate),
	episodeModal: Handlebars.compile(dom.episodeModalTemplate),
}

export function renderCharacters(data = [], append = false, search = '') {
	renderCollection({
		container: dom.charactersList,
		emptyState: dom.charactersEmptyState,
		data,
		append,
		renderItem: character => templates.characterCard({
			...normalizeCharacter(character),
			search,
		}),
	});
}

export function renderEpisodes(data = [], append = false, search = '') {
	renderCollection({
		container: dom.episodesList,
		emptyState: dom.episodesEmptyState,
		data,
		append,
		renderItem: episode => templates.episode({
			...normalizeEpisode(episode),
			search,
		}),
	});
}

export function renderCharacterModal(data) {
  if (!data) return '';

  const normalizedCharacter = normalizeCharacter(data);

  const modalData = {
    ...normalizedCharacter,
		episodes: Array.isArray(data.episodes) ? data.episodes : [],
  };

	const markup = templates.characterModal(modalData);

  if (dom.characterModalRoot) {
    dom.characterModalRoot.innerHTML = markup;
    return dom.characterModalRoot;
  }

  return markup;
}

export function renderEpisodeModal(data, characters = []) {
  if (!dom.episodeModalRoot || !data) return '';

	const rawCharacters = Array.isArray(characters) && characters.length > 0
		? characters
		: Array.isArray(data.characters) ? data.characters : [];
	const normalizedCharacters = rawCharacters.map((char) => {
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
		characters: normalizedCharacters,
  };

  dom.episodeModalRoot.innerHTML = templates.episodeModal(modalContext);

  return dom.episodeModalRoot;
}