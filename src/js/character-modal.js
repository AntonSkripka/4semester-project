import { dom } from "./dom.js";
import { fetchCharacter, fetchEpisode } from "./api.js";
import { renderCharacterModal } from "./render.js";

let modalEventsAttached = false;
let characterListEventsAttached = false;

export function closeModal() {
    if (dom.characterModalRoot) {
        dom.characterModalRoot.innerHTML = "";
    }
    document.body.style.overflow = "";
    document.removeEventListener("keydown", handleKeyDown);
}

function handleKeyDown(e) {
    if (e.key === "Escape") {
        closeModal();
    }
}

function attachModalEvents() {
    if (!dom.characterModalRoot) return;

    if (modalEventsAttached) return;

    dom.characterModalRoot.addEventListener("click", (e) => {
        const isBackdrop = e.target.classList.contains("backdrop");
        const isCloseButton = e.target.closest('[data-close="true"]');

        if (isBackdrop || isCloseButton) {
            closeModal();
        }
    });

    document.addEventListener("keydown", handleKeyDown);
    modalEventsAttached = true;
}

function getEpisodeIdFromUrl(url) {
    if (!url) return null;
    const parts = url.split("/");
    return parts[parts.length - 1];
}

export async function openCharacterModal(id) {
    if (!dom.characterModalRoot) return;

    document.body.style.overflow = "hidden";

    dom.characterModalRoot.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content modal-content--loading">
                <div class="loader">Loading...</div>
            </div>
        </div>
    `;

    try {
        const character = await fetchCharacter(id);

        if (!character) {
            throw new Error("Character not found");
        }

        const episodeUrls = (character.episode || []).slice(0, 5);

        const episodeIds = episodeUrls
            .map(getEpisodeIdFromUrl)
            .filter(Boolean);

        let episodesData = [];
        if (episodeIds.length > 0) {
            const episodesPromises = episodeIds.map((epId) => fetchEpisode(epId));
            const response = await Promise.all(episodesPromises);
            
            episodesData = Array.isArray(response) ? response : [response];
        }

        const episodes = episodesData
            .filter(Boolean)
            .map((ep) => ({
                name: ep.name,
                episode: ep.episode,
                season: ep.episode?.match(/^S(\d+)/i)?.[1] || "Not specified",
                air_date: ep.air_date
            }));

        const modalData = {
            id: character.id,
            name: character.name,
            image: character.image,
            status: character.status,
            species: character.species,
            type: character.type?.trim() || "Not specified",
            gender: character.gender,
            origin: character.origin || { name: "Unknown origin" },
            location: character.location || { name: "Unknown location" },
            episodes: episodes
        };

        renderCharacterModal(modalData);

        attachModalEvents();

    } catch (error) {
        dom.characterModalRoot.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <p>Failed to load character details.</p>
                    <button type="button" data-close="true" class="button">Close</button>
                </div>
            </div>
        `;
        attachModalEvents();
    }
}

export function initCharacterModal() {
    if (!dom.charactersList || characterListEventsAttached) return;
    characterListEventsAttached = true;

    attachModalEvents();

    dom.charactersList.addEventListener("click", (e) => {
        const card = e.target.closest(".character-card");
        
        if (card && card.dataset.id) {
            openCharacterModal(card.dataset.id);
        }
    });
}