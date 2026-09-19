import { fetchEpisode, fetchCharactersByUrls } from './api.js';
import { renderEpisodeModal } from './render.js';
import { dom } from './dom.js';

export async function openEpisodeModal(episodeId) {
  if (!dom.episodeModalRoot) return;

  try {
    const episodeData = await fetchEpisode(episodeId);

    if (!episodeData) {
      console.warn(`Episode with ID ${episodeId} not found.`);
      return;
    }

    let characters = [];
    if (Array.isArray(episodeData.characters) && episodeData.characters.length > 0) {
      characters = await fetchCharactersByUrls(episodeData.characters);
    }

    renderEpisodeModal(episodeData, characters);
    document.body.classList.add('is-modal-open');

    document.addEventListener('keydown', handleEscKey);
  } catch (error) {
    console.error(`Error loading episode modal (ID: ${episodeId}):`, error);
  }
}

export function closeEpisodeModal() {
  if (!dom.episodeModalRoot) return;

  dom.episodeModalRoot.innerHTML = '';
  document.body.classList.remove('is-modal-open');
  document.removeEventListener('keydown', handleEscKey);
}

function handleEscKey(e) {
  if (e.key === 'Escape') {
    closeEpisodeModal();
  }
}

export function initEpisodeModal() {
  if (dom.episodesList) {
    dom.episodesList.addEventListener('click', (e) => {
      const card = e.target.closest('[data-episode-id]');
      if (!card) return;

      const episodeId = card.dataset.episodeId;
      if (episodeId) {
        openEpisodeModal(episodeId);
      }
    });
  }

  if (dom.episodeModalRoot) {
    dom.episodeModalRoot.addEventListener('click', (e) => {
      const isOverlay = e.target === dom.episodeModalRoot;
      const isCloseBtn = e.target.closest('.modal__close-btn') || e.target.closest('[data-modal-close]');

      if (isOverlay || isCloseBtn) {
        closeEpisodeModal();
      }
    });
  }
}