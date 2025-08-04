const apiUrl = "https://pokeapi.co/api/v2/pokemon";
const itemsPerLoad = 20;
let offset = 0;
let allPokemons = [];

const listContainer = document.querySelector(".list-of-cards");
const loadMoreBtn = document.createElement("button");
loadMoreBtn.textContent = "Load More";
loadMoreBtn.classList.add("load-more-btn");
const loadingOverlay = createLoadingOverlay();
const modal = createModal();

const typeColors = {
  fire: "#e62829",
  water: "#2980ef",
  grass: "#3fa129",
  electric: "#fac000",
  normal: "#9fa19f",
  fighting: "#ff8000",
  flying: "#81b9ef",
  bug: "#a8b400",
  poison: "#a040a0",
  ground: "#d9b800",
  rock: "#b8a038",
  ghost: "#6060b0",
  steel: "#b8b8d0",
  fairy: "#f0b0e0",
  psychic: "#f08080",
  ice: "#b8e0f0",
  dragon: "#7038f8",
  shadow: "#000000",
};

document.querySelector(".body-wrapper").append(loadingOverlay, loadMoreBtn);

document.addEventListener("DOMContentLoaded", () => {
  loadPokemons();
  setupSearch();
});

loadMoreBtn.addEventListener("click", () => loadPokemons());

async function loadPokemons() {
  showLoading();
  toggleButton(loadMoreBtn, false);
  try {
    const response = await fetch(
      `${apiUrl}?limit=${itemsPerLoad}&offset=${offset}`
    );
    const { results } = await response.json();
    const details = await Promise.all(
      results.map((p) => fetch(p.url).then((r) => r.json()))
    );
    allPokemons.push(...details);
    renderCards(details);
    offset += itemsPerLoad;
  } catch (err) {
    console.error(err);
  } finally {
    hideLoading();
    toggleButton(loadMoreBtn, true);
  }
}

function renderCards(pokemons) {
  pokemons.forEach((p) => {
    const card = createCard(p);
    listContainer.appendChild(card);
  });
}

function createCard(pokemon) {
  const card = document.createElement("div");
  card.className = "pokemon-card";
  const primary = pokemon.types[0].type.name;
  card.style.backgroundColor = typeColors[primary] || "#777";

  const img = document.createElement("img");
  img.src = pokemon.sprites.other["official-artwork"].front_default;
  img.alt = pokemon.name;

  const title = document.createElement("h2");
  title.textContent = pokemon.name.toUpperCase();

  const typeBox = document.createElement("div");
  typeBox.className = "type-container";
  pokemon.types.forEach((t) => {
    const span = document.createElement("span");
    span.className = `type ${t.type.name}`;
    span.textContent = t.type.name;
    typeBox.append(span);
  });

  card.append(img, title, typeBox);
  card.addEventListener("mouseenter", () => card.classList.add("hover"));
  card.addEventListener("mouseleave", () => card.classList.remove("hover"));

  card.addEventListener("click", () => openModal(pokemon.id));
  return card;
}

function createLoadingOverlay() {
  const overlay = document.createElement("div");
  overlay.className = "loading-overlay";
  overlay.innerHTML = '<div class="spinner"></div>';
  overlay.style.display = "none";
  return overlay;
}

function showLoading() {
  loadingOverlay.style.display = "flex";
}

function hideLoading() {
  loadingOverlay.style.display = "none";
}

function toggleButton(btn, enabled) {
  btn.disabled = !enabled;
}

function setupSearch() {
  const input = document.querySelector(".header-right input");
  input.addEventListener(
    "input",
    debounce(() => {
      const term = input.value.trim().toLowerCase();
      if (term.length >= 3) filterList(term);
      if (term.length >= 3) {
        filterList(term);
      } else {
        listContainer.innerHTML = "";
        renderCards(allPokemons);
      }
    }, 300)
  );
}

function filterList(term) {
  listContainer.innerHTML = "";
  const filtered = allPokemons.filter((p) => p.name.includes(term));
  renderCards(filtered);
}

function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

document.body.appendChild(modal.overlay);

function openModal(id) {
  const pokemon = allPokemons.find((p) => p.id === id);
  if (!pokemon) return;
  modal.setContent(pokemon);
  modal.show();
}

function createModal() {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal-content">
      <button class="close-btn">×</button>
      <div class="modal-body"></div>
      <div class="nav-arrows">
        <button class="prev">←</button>
        <button class="next">→</button>
      </div>
    </div>`;
  overlay.style.display = "none";

  const closeBtn = overlay.querySelector(".close-btn");
  closeBtn.addEventListener("click", hide);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) hide();
  });

  overlay.querySelector(".prev").addEventListener("click", () => navigate(-1));
  overlay.querySelector(".next").addEventListener("click", () => navigate(1));

  function setContent(pokemon) {
    const primary = pokemon.types[0].type.name;
    const color = typeColors[primary] || "#777";
    const body = overlay.querySelector(".modal-body");

    body.innerHTML = `
    <h2>${pokemon.name.toUpperCase()} (#${pokemon.id})</h2>
    <div class="type-container">
      ${pokemon.types
        .map((t) => `<span class="type">${t.type.name}</span>`)
        .join("")}
    </div>
    <img src="${
      pokemon.sprites.other["official-artwork"].front_default
    }" alt="${pokemon.name}">
    <div class="stats">
      ${pokemon.stats
        .map(
          (s) => `
        <div class="stat" style="color: ${color}">
          <span class="stat-name">${s.stat.name}</span>
          <div class="stat-bar">
            <div class="stat-bar-inner" style="width: ${s.base_stat}%;"></div>
          </div>
          <span class="stat-value">${s.base_stat}</span>
        </div>
      `
        )
        .join("")}
    </div>
  `;

    const modalCard = overlay.querySelector(".modal-content");
    modalCard.style.borderTopColor = color;
    currentId = pokemon.id;
  }

  let currentId;
  function navigate(dir) {
    const nextId =
      ((currentId - 1 + dir + allPokemons.length) % allPokemons.length) + 1;
    setContent(allPokemons.find((p) => p.id === nextId));
  }

  function show() {
    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";
  }
  function hide() {
    overlay.style.display = "none";
    document.body.style.overflow = "";
  }

  return { overlay, setContent, show, hide };
}