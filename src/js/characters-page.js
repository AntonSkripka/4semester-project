import { dom } from "./dom";
import { fetchCharacters } from "./api.js";
import { renderCharacters } from "./render.js";

const DEFAULT_FILTER_VALUE = 'all';

const state = {
    page: 1,
    totalPages: 1,
    filters: {
        status: 'all',
        species: 'all',
        type: 'all',
        gender: 'all',
        name: ''
    },
    isLoading: false,
    requestId: 0
};

let isInitialized = false;

function closeAllDropdowns() {
    dom.characterDropdowns.forEach(dropdown => {
        dropdown.classList.remove("dropdown--open");
    });
}

function prepareForm(e) {
    e.preventDefault();
    state.filters = getFiltersFromForm();

    state.page = 1;

    loadCharacters({ append: false });
}

function getFiltersFromForm() {
    const formData = new FormData(dom.charactersFilters);

    return {
        name: formData.get("name")?.trim() || "",
        status: formData.get("status") || DEFAULT_FILTER_VALUE,
        species: formData.get("species") || DEFAULT_FILTER_VALUE,
        type: formData.get("type") || DEFAULT_FILTER_VALUE,
        gender: formData.get("gender") || DEFAULT_FILTER_VALUE,
    };
}

function setLoadingState(isLoading) {
    state.isLoading = isLoading;
    if (dom.charactersSearchButton) dom.charactersSearchButton.disabled = isLoading;
    if (dom.charactersLoadMore) dom.charactersLoadMore.disabled = isLoading;
}

function updateLoadMoreVisibility() {
    if (!dom.charactersLoadMore) return;
    dom.charactersLoadMore.hidden = state.page >= state.totalPages;
}

async function loadCharacters({ append = false } = {}) {
    const currentRequestId = ++state.requestId;
    
    setLoadingState(true);

    try {
        const queryParams = {
            page: state.page,
            ...state.filters
        };

        const response = await fetchCharacters(queryParams);
        if (currentRequestId !== state.requestId) return;
        state.totalPages = response?.info?.pages || 1;

        renderCharacters(response?.results || [], append, state.filters.name);

        updateLoadMoreVisibility();

    } catch (error) {
        if (currentRequestId !== state.requestId) return;

        state.totalPages = 1;
        renderCharacters([], false, state.filters.name);
        
        if (dom.charactersLoadMore) dom.charactersLoadMore.hidden = true;
    } finally {
        if (currentRequestId === state.requestId) {
            setLoadingState(false);
        }
    }
}

export function initCharactersPage() {
    if (isInitialized) return;
    isInitialized = true;

    loadCharacters({ append: false });

    dom.characterDropdowns.forEach((dropdown) => {
        const trigger = dropdown.querySelector(".dropdown__trigger");
        const valueDisplay = dropdown.querySelector(".dropdown__value");
        const items = dropdown.querySelectorAll(".dropdown__item");
        const selectType = dropdown.dataset.select;

        trigger?.addEventListener("click", (e) => {
            e.stopPropagation();
            
            const isOpen = dropdown.classList.contains("dropdown--open");
            closeAllDropdowns();

            if (!isOpen) {
                dropdown.classList.add("dropdown--open");
            }
        });

        items.forEach((item) => {
            item.addEventListener("click", (e) => {
                e.stopPropagation();
                
                const selectedValue = item.dataset.value;
                const selectedText = item.textContent.trim();

                if (valueDisplay) {
                    valueDisplay.textContent = selectedText;
                }

                items.forEach(i => i.classList.remove("dropdown__item--selected"));
                item.classList.add("dropdown__item--selected");

                const nativeSelect = dom.charactersFilters?.querySelector(`select[name="${selectType}"]`);
                if (nativeSelect) {
                    nativeSelect.value = selectedValue;
                    nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
                }

                dropdown.classList.remove("dropdown--open");
            });
        });
    });

    document.addEventListener("click", () => closeAllDropdowns());
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeAllDropdowns();
    });
    dom.charactersFilters?.addEventListener("submit", prepareForm);
    dom.charactersLoadMore?.addEventListener("click", () => {
        if (state.isLoading || state.page >= state.totalPages) return;
        state.page += 1;
        loadCharacters({ append: true });
    });
    dom.charactersFilters?.addEventListener("change", (e) => {
        if (e.target.name !== "name") {
            prepareForm(e);
        }
    });
}