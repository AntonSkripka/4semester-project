import '../sass/main.scss'
import { dom } from './dom'
import { renderCharacters, renderEpisodes } from './render'

function getPageType() {
  const path = window.location.pathname;

  if (path.includes('characters.html') || document.querySelector('#characters-list')) {
    return 'characters';
  }
  if (path.includes('episodes.html') || document.querySelector('.episodes__list')) {
    return 'episodes';
  }
  return 'home';
}

// function init() {
// 	// TODO: connect page-specific API requests, rendering and event listeners.
// 	void renderCharacters
// 	void renderEpisodes

// 	console.log('Vite application started.', {
// 		page: window.location.pathname,
// 		availableDomNodes: Object.values(dom).filter(Boolean).length,
// 	});
// }

document.addEventListener('DOMContentLoaded', () => {
  const page = getPageType();
  console.log(`App initialized on page: ${page}`);

  switch (page) {
    case 'characters':
      console.log('Сторінка персонажів');
      // initCharactersPage();
      break;
    case 'episodes':
      console.log('Сторінка єпізодів');
      // initEpisodesPage();
      break;
    default:
      console.log('Головна сторінка');
      // initHomePage();
      break;
  }
});
