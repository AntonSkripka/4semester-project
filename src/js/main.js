import '../sass/main.scss'
import { dom } from './dom'
import { renderCharacters, renderEpisodes } from './render'

function init() {
	// TODO: connect page-specific API requests, rendering and event listeners.
	void renderCharacters
	void renderEpisodes

	console.log('Vite application started.', {
		page: window.location.pathname,
		availableDomNodes: Object.values(dom).filter(Boolean).length,
	})
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init, { once: true })
} else {
	init()
}
