import '../sass/main.scss';
import { dom } from './dom';
import { PromoSlider } from './promoSlider';
import { initEpisodesPage } from './episodes-page';
import { initEpisodeModal } from './episode-modal';
import { initCharactersPage } from './characters-page';
import { initCharacterModal } from "./character-modal.js";

const TABLET_BREAKPOINT = 768;
const AUTOPLAY_DELAY = 3000;
const DRAG_THRESHOLD = 50;

const getImageUrl = (path) => new URL(`../images/${path}`, import.meta.url).href;
const backgroundImageUrl = getImageUrl('background-1x.png');

document.documentElement.style.setProperty('--background-image', `url("${backgroundImageUrl}")`);

const CHARACTERS_CONFIG = {
  rick: {
    mobile: getImageUrl('rick-smart-1x.jpg'),
    tablet: getImageUrl('rick-tablet-1x.jpg'),
    bg: 'var(--green)',
    width: { mobile: '205px', tablet: '395px' },
    height: { mobile: '308px', tablet: '627px' },
  },
  morty: {
    mobile: getImageUrl('morty-smart-1x.jpg'),
    tablet: getImageUrl('morty-tablet-1x.jpg'),
    bg: '#0d171d',
    width: { mobile: '113px', tablet: '220px' },
    height: { mobile: '279px', tablet: '565px' },
  },
  summer: {
    mobile: getImageUrl('summer-smart-1x.jpg'),
    tablet: getImageUrl('summer-tablet-1x.jpg'),
    bg: '#daf836',
    width: { mobile: '80px', tablet: '152px' },
    height: { mobile: '295px', tablet: '560px' },
  },
  beth: {
    mobile: getImageUrl('bet-smart-1x.jpg'),
    tablet: getImageUrl('bet-tablet-1x.jpg'),
    bg: '#a1d737',
    width: { mobile: '81px', tablet: '150px' },
    height: { mobile: '291px', tablet: '537px' },
  },
  jerry: {
    mobile: getImageUrl('jerry-smart-1x.jpg'),
    tablet: getImageUrl('jerry-tablet-1x.jpg'),
    bg: '#0d171d',
    width: { mobile: '78px', tablet: '148px' },
    height: { mobile: '287px', tablet: '537px' },
  },
};

const STATIC_IMAGES = [
  { selector: '.RickAndMortyUsingAfuturisticDevice', filename: 'RickAndMortyUsingAfuturisticDevice-1x.png' },
  { selector: '.ricAndMorty', filename: 'ricAndMorty-1x.png' },
  { selector: '.ricAndMortyAndBabochka', filename: 'ricAndMortyAndBabochka-1x.png' },
  { selector: '.RicAndBethAndJerry', filename: 'RicAndBethAndJerry-1x.png' },
  { selector: '.MortyAndSummerInSpace', filename: 'MortyAndSummerInSpace-1x.png' },
];

const mediaQueryTablet = window.matchMedia(`(min-width: ${TABLET_BREAKPOINT}px)`);
let activeCharacterElement = null;

function updateCharacterDisplay(name) {
  const cfg = CHARACTERS_CONFIG[name];
  if (!cfg) return;

  const isTablet = mediaQueryTablet.matches;
  const deviceKey = isTablet ? 'tablet' : 'mobile';

  const { mainCharacterImage, mainCharacterFigure } = dom;

  if (mainCharacterImage) {
    mainCharacterImage.src = cfg[deviceKey] || cfg.mobile;
    mainCharacterImage.style.width = cfg.width[deviceKey];
    mainCharacterImage.style.height = cfg.height[deviceKey];
  }

  if (mainCharacterFigure) {
    mainCharacterFigure.style.backgroundColor = cfg.bg;
  }
}

function handleCharacterSelect(element) {
  if (!element) return;

  if (activeCharacterElement && activeCharacterElement !== element) {
    activeCharacterElement.classList.remove('main-characters__item--active');
  }

  activeCharacterElement = element;
  activeCharacterElement.classList.add('main-characters__item--active');

  const characterName = element.dataset.character;
  updateCharacterDisplay(characterName);
}

function initStaticImages() {
  STATIC_IMAGES.forEach(({ selector, filename }) => {
    const img = document.querySelector(selector);
    if (img) {
      img.src = getImageUrl(filename);
    }
  });
}

function initHeader() {
  const currentPath = window.location.pathname;
  const headerLinks = dom.headerList?.querySelectorAll('.header__list-link') || [];

  headerLinks.forEach((link) => {
    const isCharacters = currentPath.includes('characters.html') && link.href.includes('characters.html');
    const isEpisodes = currentPath.includes('episodes.html') && link.href.includes('episodes.html');
    link.classList.toggle('active', isCharacters || isEpisodes);
    if (isCharacters || isEpisodes) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });

  const input = dom.headerSearchInput;
  const dropdown = dom.headerSearchDropdown;
  if (!input || !dropdown) return;

  const options = [...dropdown.querySelectorAll('li')];
  const updateSearch = () => {
    const query = input.value.trim().toLowerCase();
    let visibleCount = 0;

    options.forEach((option) => {
      const link = option.querySelector('a');
      const matches = query === '' || link.textContent.trim().toLowerCase().includes(query);
      option.hidden = !matches;
      if (matches) visibleCount += 1;
    });

    dropdown.hidden = query === '' || visibleCount === 0;
  };

  input.addEventListener('focus', updateSearch);
  input.addEventListener('input', updateSearch);
  document.addEventListener('click', (event) => {
    if (!dropdown.contains(event.target) && event.target !== input) dropdown.hidden = true;
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      input.value = '';
      dropdown.hidden = true;
      input.blur();
    }
  });
}

function initHomePage() {
  if (dom.mainCharacterItems && dom.mainCharacterItems.length > 0) {
    dom.mainCharacterItems.forEach((element) => {
      if (element.classList.contains('main-characters__item--active')) {
        handleCharacterSelect(element);
      }

      element.addEventListener('click', (e) => handleCharacterSelect(e.currentTarget));
    });

    mediaQueryTablet.addEventListener('change', () => {
      if (activeCharacterElement) {
        updateCharacterDisplay(activeCharacterElement.dataset.character);
      }
    });
  }

  initStaticImages();
  if (dom.promoSlider) {
    new PromoSlider(dom.promoSlider, {
      autoplayDelay: AUTOPLAY_DELAY,
      dragThreshold: DRAG_THRESHOLD,
    });
  }
}

function getPageType() {
  const { pathname } = window.location;

  if (pathname.includes('characters.html') || document.querySelector('#characters-list')) {
    return 'characters';
  }
  if (pathname.includes('episodes.html') || document.querySelector('.episodes__list')) {
    return 'episodes';
  }
  return 'home';
}

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  const page = getPageType();

  switch (page) {
    case 'characters':
      initCharactersPage();
      initCharacterModal();
      break;
    case 'episodes':
      initEpisodesPage();
      initEpisodeModal();
      break;
    default:
      initHomePage();
      break;
  }
});