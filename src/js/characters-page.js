import { dom } from "./dom";
import { fetchCharacters } from "./api.js";
import { renderCharacters } from "./render.js";

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

function closeAllDropdowns() {
    dom.characterDropdowns.forEach(dropdown => {
        dropdown.classList.remove("dropdown--open");
    });
}

function prepareForm(e) {
    e.preventDefault();
    const formData = new FormData(dom.charactersFilters);
    
    state.filters.name = formData.get("name")?.trim() || "";
    state.filters.status = formData.get("status") || "all";
    state.filters.species = formData.get("species") || "all";
    state.filters.type = formData.get("type") || "all";
    state.filters.gender = formData.get("gender") || "all";

    state.page = 1;

    loadCharacters({ append: false });
}

async function loadCharacters({ append = false } = {}) {
    const currentRequestId = ++state.requestId;
    
    state.isLoading = true;

    if (dom.charactersSearchButton) dom.charactersSearchButton.disabled = true;
    if (dom.charactersLoadMore) dom.charactersLoadMore.disabled = true;

    try {
        const queryParams = {
            page: state.page,
            ...state.filters
        };

        const response = await fetchCharacters(queryParams);
        if (currentRequestId !== state.requestId) return;
        state.totalPages = response?.info?.pages || 1;

        renderCharacters(response?.results || [], append, state.filters.name);

        if (dom.charactersLoadMore) {
            const hasMorePages = state.page < state.totalPages;
            dom.charactersLoadMore.hidden = !hasMorePages;
        }

    } catch (error) {
        if (currentRequestId !== state.requestId) return;

        state.totalPages = 1;
        renderCharacters([], false, state.filters.name);
        
        if (dom.charactersLoadMore) {
            dom.charactersLoadMore.hidden = true;
        }
    } finally {
        if (currentRequestId === state.requestId) {
            state.isLoading = false;
            if (dom.charactersSearchButton) dom.charactersSearchButton.disabled = false;
            if (dom.charactersLoadMore) dom.charactersLoadMore.disabled = false;
        }
    }
}

export function initCharactersPage() {
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