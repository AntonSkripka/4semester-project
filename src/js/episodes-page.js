import { fetchEpisodes } from './api.js';
import { renderEpisodes } from './render.js';
import { dom } from './dom.js';

// --- Локальное состояние ---
const state = {
  page: 1,
  totalPages: 1,
  search: '',
  season: 'all',
  isLoading: false,
};

// --- Основная функция загрузки данных ---
async function loadEpisodes(append = false) {
  if (state.isLoading) return;
  state.isLoading = true;

  const filters = {
    page: state.page,
    name: state.search,
  };

  try {
    const response = await fetchEpisodes(filters);

    state.totalPages = response.info.pages;

    // Фильтрация по сезону на клиенте (код эпизода из API имеет вид "S01E01")
    let items = response.results;
    if (state.season !== 'all') {
      const seasonPrefix = `S${state.season.padStart(2, '0')}`;
      items = items.filter((ep) => ep.episode && ep.episode.startsWith(seasonPrefix));
    }

    renderEpisodes(items, append);

    // Скрываем/показываем кнопку Load More
    updateLoadMoreButton(Boolean(response.info.next) && state.page < state.totalPages);
  } catch (error) {
    console.error('Failed to load episodes:', error);
    updateLoadMoreButton(false);
  } finally {
    state.isLoading = false;
  }
}

// --- Управление кнопкой Load More ---
function updateLoadMoreButton(hasMore) {
  if (!dom.episodesLoadMore) return;
  dom.episodesLoadMore.style.display = hasMore ? 'block' : 'none';
}

// --- Сброс состояния при новом поиске/сезоне ---
function resetAndLoad() {
  state.page = 1;
  loadEpisodes(false);
}

// --- Инициализация страницы эпизодов ---
export function initEpisodesPage() {
  if (!dom.episodesList) return;

  // 1. Первая загрузка
  loadEpisodes(false);

  // 2. Обработка поиска по кнопке или по нажатию Enter в инпуте
  if (dom.episodesSearchButton) {
    dom.episodesSearchButton.addEventListener('click', (e) => {
      e.preventDefault();
      const rawValue = dom.episodesSearchInput?.value || '';
      state.search = rawValue.trim();
      resetAndLoad();
    });
  }

  if (dom.episodesSearchInput) {
    dom.episodesSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const rawValue = dom.episodesSearchInput.value || '';
        state.search = rawValue.trim();
        resetAndLoad();
      }
    });
  }

  // 3. Обработка Load More
  if (dom.episodesLoadMore) {
    dom.episodesLoadMore.addEventListener('click', () => {
      if (state.page < state.totalPages) {
        state.page += 1;
        loadEpisodes(true);
      }
    });
  }

  // 4. Логика Выпадающего Списка Сезонов
  initSeasonDropdown();
}

// --- Логика Кастомного Дропдауна (с учетом класса .is-hidden) ---
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

  // Клик по пункту из списка (делегирование через dropdown)
  dropdown.addEventListener('click', (e) => {
    const item = e.target.closest('.episodes__dropdown-item');
    if (!item) return;

    const selectedSeason = item.dataset.season || 'all';
    state.season = selectedSeason;

    // Обновляем текст в инпуте (.episodes__filters-input)
    if (inputLabel) {
      inputLabel.value = item.textContent.trim();
    }

    // Переключаем активный класс .active
    dropdown.querySelectorAll('.episodes__dropdown-item').forEach((el) => {
      el.classList.toggle('active', el === item);
    });

    toggleDropdown(false);
    resetAndLoad();
  });

  // Закрытие по клику вне списка и по Escape
  document.addEventListener('click', () => toggleDropdown(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggleDropdown(false);
  });
}