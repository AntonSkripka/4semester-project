import characterCardSource from '../templates/character-card.hbs?raw'
import episodesSource from '../templates/episodes.hbs?raw'
import episodeModalSource from '../templates/episode-modal.hbs?raw'

export const dom = {
	body: document.body,
	header: document.querySelector('.header'),
	headerLogo: document.querySelector('.header__logo'),
	headerList: document.querySelector('.header__list'),
	headerSearchInput: document.getElementById('headerSearchInput'),
	main: document.querySelector('main'),
	footer: document.querySelector('.footer'),
	charactersRoot: document.getElementById('characters-root'),
	charactersFilters: document.getElementById('characters-filters'),
	charactersNameInput: document.getElementById('filter-name'),
	charactersSearchButton: document.querySelector('.filters__button--search'),
	characterDropdowns: document.querySelectorAll('.dropdown'),
	charactersList: document.getElementById('characters-list'),
	charactersLoadMore: document.getElementById('characters-load-more'),
	characterModalRoot: document.getElementById('character-modal-root'),
	episodesList: document.querySelector('.episodes__list'),
	episodesSearchInput: document.querySelector('.episodes__input'),
	episodesSearchButton: document.querySelector('.episodes__search-button'),
	episodesSeasonInput: document.querySelector('.episodes__filters-input'),
	episodesSeasonButton: document.querySelector('.episodes__filters-button'),
	episodesDropdown: document.querySelector('.episodes__dropdown'),
	episodesDropdownItems: document.querySelectorAll('.episodes__dropdown-item'),
	episodesLoadMore: document.querySelector('.episodes__load-button'),
	episodeModalRoot: document.getElementById('episode-modal-root'),
	promo: document.querySelector('.rnm-promo'),
	promoButton: document.querySelector('.rnm-promo__button'),
	promoSlider: document.querySelector('[data-rnm-slider]'),
	buttons: document.querySelectorAll('.btn'),
	mainCharacterFigure: document.querySelector('.main-characters__figure'),
	mainCharacterImage: document.querySelector('.main-characters__image'),
	mainCharacterItems: document.querySelectorAll('.main-characters__item'),
	heroButtonList: document.querySelector('.buttons-hero-list'),
	characterCardTemplate: characterCardSource,
	episodesTemplate: episodesSource,
	episodeModalTemplate: episodeModalSource,
}

export const characterFilterSelects = {
	status: document.getElementById('filter-status'),
	species: document.getElementById('filter-species'),
	type: document.getElementById('filter-type'),
	gender: document.getElementById('filter-gender'),
}