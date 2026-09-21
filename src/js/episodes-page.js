import { fetchEpisodes } from './api.js';
import { renderEpisodes } from './render.js';
import { dom } from './dom.js';

const ALL_SEASONS = 'all';
const MAX_SEARCH_LENGTH = 80;

const state = {
  page: 1,
  totalPages: 1,
  search: '',
  season: ALL_SEASONS,
  isLoading: false,
};

let isInitialized = false;

async function loadEpisodes(append = false, loadAll = false) {
  if (state.isLoading) return;
  state.isLoading = true;

  const filters = {
    page: state.page,
    name: state.search,
  };

  try {
    let response = await fetchEpisodes(filters);
    let items = filterEpisodesBySeason(response.results);

    state.totalPages = response.info.pages;

    if (loadAll) {
      const allItems = [...items];

      while (hasNextPage(response)) {
        state.page += 1;
        response = await fetchEpisodes({ ...filters, page: state.page });
        state.totalPages = response.info.pages;
        allItems.push(...filterEpisodesBySeason(response.results));
      }

      items = allItems;
    }

    while (
      !loadAll && items.length === 0 && hasNextPage(response)
    ) {
      state.page += 1;
      response = await fetchEpisodes({ ...filters, page: state.page });
      state.totalPages = response.info.pages;
      items = filterEpisodesBySeason(response.results);
    }

    renderEpisodes(items, append, state.search);

    updateLoadMoreButton(!loadAll && hasNextPage(response));
  } catch (error) {
    updateLoadMoreButton(false);
  } finally {
    state.isLoading = false;
  }
}

function hasNextPage(response) {
  return Boolean(response.info.next) && state.page < state.totalPages;
}

function filterEpisodesBySeason(episodes = []) {
  if (state.season === ALL_SEASONS) return Array.isArray(episodes) ? episodes : [];

  const seasonPrefix = `S${state.season.padStart(2, '0')}`;
  return (Array.isArray(episodes) ? episodes : []).filter(
    (episode) => episode.episode && episode.episode.startsWith(seasonPrefix),
  );
}

function updateLoadMoreButton(hasMore) {
  if (!dom.episodesLoadMore) return;
  dom.episodesLoadMore.style.display = hasMore ? 'block' : 'none';
}

function resetAndLoad(loadAll = state.season !== ALL_SEASONS) {
  state.page = 1;
  loadEpisodes(false, loadAll);
}

function getValidatedSearchValue(input) {
  if (!input) return '';

  const value = input.value.trim();
  input.setCustomValidity('');

  if (value.length > MAX_SEARCH_LENGTH || /[\u0000-\u001F\u007F]/.test(value)) {
    input.setCustomValidity('Enter a valid episode name.');
    input.reportValidity();
    return null;
  }

  return value;
}

export function initEpisodesPage() {
  if (!dom.episodesList || isInitialized) return;
  isInitialized = true;

  loadEpisodes(false);

  if (dom.episodesSearchButton) {
    dom.episodesSearchButton.addEventListener('click', (e) => {
      e.preventDefault();
      const value = getValidatedSearchValue(dom.episodesSearchInput);
      if (value === null) return;
      state.search = value;
      resetAndLoad();
    });
  }

  if (dom.episodesSearchInput) {
    dom.episodesSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
          const value = getValidatedSearchValue(dom.episodesSearchInput);
          if (value === null) return;
          state.search = value;
        resetAndLoad();
      }
    });

      dom.episodesSearchInput.addEventListener('input', () => {
        dom.episodesSearchInput.setCustomValidity('');
      });
  }

  if (dom.episodesLoadMore) {
    dom.episodesLoadMore.addEventListener('click', () => {
      if (state.page < state.totalPages) {
        state.page += 1;
        loadEpisodes(true);
      }
    });
  }

  initSeasonDropdown();
}

function initSeasonDropdown() {
  const btn = dom.episodesSeasonButton;
  const dropdown = dom.episodesDropdown;
  const inputLabel = dom.episodesSeasonInput;

  if (!btn || !dropdown) return;

  const toggleDropdown = (open) => {
    if (open === undefined) {
      dropdown.classList.toggle('is-hidden');
    } else if (open) {
      dropdown.classList.remove('is-hidden');
    } else {
      dropdown.classList.add('is-hidden');
    }
  };

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown();
  });

  dropdown.addEventListener('click', (e) => {
    const item = e.target.closest('.episodes__dropdown-item');
    if (!item) return;

    const selectedSeason = item.dataset.season || ALL_SEASONS;
    state.season = selectedSeason;

    if (inputLabel) {
      inputLabel.value = item.textContent.trim();
    }

    dropdown.querySelectorAll('.episodes__dropdown-item').forEach((el) => {
      el.classList.toggle('active', el === item);
    });

    toggleDropdown(false);
    resetAndLoad();
  });

  document.addEventListener('click', () => toggleDropdown(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggleDropdown(false);
  });
}