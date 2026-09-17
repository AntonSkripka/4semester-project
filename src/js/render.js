import Handlebars from 'handlebars'
import { dom } from './dom'

Handlebars.registerHelper('fallback', (value, fallbackValue) => value || fallbackValue)

export const templates = {
	characterCard: Handlebars.compile(dom.characterCardTemplate),
	episode: Handlebars.compile(dom.episodesTemplate),
	episodeModal: Handlebars.compile(dom.episodeModalTemplate),
}

export function renderCharacters(data = [], append = false) {
	// TODO: pass id, name, image, origin.name and location.name to character-card.hbs.
	if (!dom.charactersList) return
	const markup = data.map(character => templates.characterCard(character)).join('')
	if (append) dom.charactersList.insertAdjacentHTML('beforeend', markup)
	else dom.charactersList.innerHTML = markup
}

export function renderEpisodes(data = [], append = false) {
	// TODO: normalize name, episode season code and air_date for episodes.hbs.
	if (!dom.episodesList) return
	const markup = data.map(episode => templates.episode(episode)).join('')
	if (append) dom.episodesList.insertAdjacentHTML('beforeend', markup)
	else dom.episodesList.innerHTML = markup
}

export function renderCharacterModal(data) {
	// TODO: render character details and the first five related episodes.
	if (!data) return ''
	return templates.characterCard(data)
}

export function renderEpisodeModal(data) {
	// TODO: pass title, id, air_date and characters[{ name, image }] to episode-modal.hbs.
	if (!dom.episodeModalRoot || !data) return ''
	dom.episodeModalRoot.innerHTML = templates.episodeModal(data)
	return dom.episodeModalRoot
}