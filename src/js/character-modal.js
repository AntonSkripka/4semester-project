import { dom } from "./dom.js";
import { fetchCharacter, fetchEpisode } from "./api.js";
import { renderCharacterModal } from "./render.js";

let modalEventsAttached = false;

// Функция закрытия окна и очистки обработчиков
export function closeModal() {
    if (dom.characterModalRoot) {
        dom.characterModalRoot.innerHTML = "";
    }
    // Восстанавливаем скролл страницы
    document.body.style.overflow = "";

    // Удаляем слушатель клавиатуры, чтобы не плодить утечки памяти
    document.removeEventListener("keydown", handleKeyDown);
}

// Обработчик клавиши Escape
function handleKeyDown(e) {
    if (e.key === "Escape") {
        closeModal();
    }
}

// Слушатель кликов внутри модалки (закрытие по оверлею или крестику)
function attachModalEvents() {
    if (!dom.characterModalRoot) return;

    if (modalEventsAttached) return;

    dom.characterModalRoot.addEventListener("click", (e) => {
        // Проверяем, был ли клик по фону (оверлею) или элементу с data-close="true" (крестик)
        const isBackdrop = e.target.classList.contains("backdrop");
        const isCloseButton = e.target.closest('[data-close="true"]');

        if (isBackdrop || isCloseButton) {
            closeModal();
        }
    });

    // Добавляем обработчик нажатия Escape
    document.addEventListener("keydown", handleKeyDown);
    modalEventsAttached = true;
}

// Извлечение ID эпизода из его URL (например, из "https://rickandmortyapi.com/api/episode/28" получим 28)
function getEpisodeIdFromUrl(url) {
    if (!url) return null;
    const parts = url.split("/");
    return parts[parts.length - 1];
}

// Главная функция открытия модального окна
export async function openCharacterModal(id) {
    if (!dom.characterModalRoot) return;

    // 1. Блокируем скролл страницы
    document.body.style.overflow = "hidden";

    // 2. Показываем модальное окно с лоадером
    dom.characterModalRoot.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content modal-content--loading">
                <div class="loader">Loading...</div>
            </div>
        </div>
    `;

    try {
        // 3. Запрашиваем полные данные персонажа по ID
        const character = await fetchCharacter(id);

        if (!character) {
            throw new Error("Character not found");
        }

        // 4. Берем первые 5 URL-адресов эпизодов
        const episodeUrls = (character.episode || []).slice(0, 5);

        // Извлекаем их ID
        const episodeIds = episodeUrls
            .map(getEpisodeIdFromUrl)
            .filter(Boolean);

        // 5. Загружаем данные по этим эпизодам (параллельно через Promise.all)
        let episodesData = [];
        if (episodeIds.length > 0) {
            const episodesPromises = episodeIds.map((epId) => fetchEpisode(epId));
            const response = await Promise.all(episodesPromises);
            
            // Если вернулся 1 эпизод или массив эпизодов — нормализуем
            episodesData = Array.isArray(response) ? response : [response];
        }

        // Формируем структурированный массив эпизодов для шаблона
        const episodes = episodesData
            .filter(Boolean)
            .map((ep) => ({
                name: ep.name,
                episode: ep.episode,
                season: ep.episode?.match(/^S(\d+)/i)?.[1] || "Not specified",
                air_date: ep.air_date
            }));

        // 6. Подготавливаем полный объект данных персонажа
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

        // 8. Подключаем слушатели событий закрытия
        attachModalEvents();

    } catch (error) {
        console.error("Ошибка при открытии модального окна:", error);
        
        // В случае ошибки показываем плашку и кнопку закрытия
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

// Инициализация делегирования кликов по карточкам персонажей
export function initCharacterModal() {
    if (!dom.charactersList) return;

    attachModalEvents();

    // Делегирование событий на контейнер списка персонажей
    dom.charactersList.addEventListener("click", (e) => {
        // Ищем ближайшую карточку
        const card = e.target.closest(".character-card");
        
        if (card && card.dataset.id) {
            openCharacterModal(card.dataset.id);
        }
    });
}