const apiUrl = "https://pokeapi.co/api/v2/pokemon";
const itemsPerLoad = 20;
let offset = 0;
let allPokemons = [];

const listContainer = document.querySelector(".list-of-cards");
const loadMoreBtn = document.createElement("button");
loadMoreBtn.textContent = "Load More";
loadMoreBtn.classList.add("load-more-btn");
const loadingOverlay = createLoadingOverlay();

document.querySelector(".body-wrapper").append(loadingOverlay, loadMoreBtn);

document.addEventListener("DOMContentLoaded", () => {
  loadPokemons();
  setupSearch();
});