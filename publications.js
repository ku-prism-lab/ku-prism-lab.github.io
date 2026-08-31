// Adapted from the publication search/filter implementation used by KAIST VILab.
document.addEventListener("DOMContentLoaded", () => {
  const publicationsContainer = document.querySelector(".publications-content");
  const filterContainer = document.querySelector(".publication-filters");
  const searchInput = document.querySelector(".publication-search input");
  const resultCount = document.querySelector(".publication-count");

  if (!publicationsContainer || !filterContainer || !searchInput || !window.publicationsData) return;

  const allPublications = window.publicationsData;
  let currentYear = "all";
  let currentSearch = "";

  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function emphasizePI(authors) {
    return escapeHTML(authors).replaceAll("Hyungjin Chung", "<strong>Hyungjin Chung</strong>");
  }

  function createFilterButtons() {
    const years = [...new Set(allPublications.map((publication) => publication.year))].sort(
      (first, second) => second - first,
    );

    years.forEach((year) => {
      const button = document.createElement("button");
      button.className = "filter-btn";
      button.type = "button";
      button.dataset.filterYear = String(year);
      button.textContent = year;
      filterContainer.append(button);
    });
  }

  function createPublicationHTML(publication) {
    const visual = publication.image
      ? `<img src="${escapeHTML(publication.image)}" alt="" loading="lazy">`
      : `<span class="publication-placeholder" aria-hidden="true">${escapeHTML(publication.short)}</span>`;
    const links = publication.links
      .map(
        ([label, url]) =>
          `<a href="${escapeHTML(url)}" target="_blank" rel="noreferrer">${escapeHTML(label)}</a>`,
      )
      .join("");
    const note = publication.note
      ? `<p class="publication-note">${escapeHTML(publication.note)}</p>`
      : "";

    return `
      <article class="publication-row">
        <div class="publication-visual">${visual}</div>
        <div class="publication-info">
          <p class="publication-meta">${escapeHTML(publication.short)}</p>
          <h3>${escapeHTML(publication.title)}</h3>
          <p class="publication-authors">${emphasizePI(publication.authors)}</p>
          <p class="publication-venue">${escapeHTML(publication.venue)}</p>
          ${note}
          <p class="publication-links">${links}</p>
        </div>
      </article>`;
  }

  function groupPublicationsByYear(publications) {
    return publications.reduce((groups, publication) => {
      if (!groups[publication.year]) groups[publication.year] = [];
      groups[publication.year].push(publication);
      return groups;
    }, {});
  }

  function displayPublications(publications) {
    resultCount.textContent = `${publications.length} publication${publications.length === 1 ? "" : "s"}`;

    if (!publications.length) {
      publicationsContainer.innerHTML = `
        <div class="publication-empty">
          <p>No publications found matching your search.</p>
          <button type="button" class="clear-publication-search">Clear search</button>
        </div>`;
      publicationsContainer.querySelector("button").addEventListener("click", () => {
        currentSearch = "";
        currentYear = "all";
        searchInput.value = "";
        filterContainer.querySelectorAll(".filter-btn").forEach((button) => {
          button.classList.toggle("active", button.dataset.filterYear === "all");
        });
        displayPublications(allPublications);
        searchInput.focus();
      });
      return;
    }

    const publicationsByYear = groupPublicationsByYear(publications);
    publicationsContainer.innerHTML = Object.keys(publicationsByYear)
      .sort((first, second) => second - first)
      .map(
        (year) => `
          <section class="publication-year" aria-labelledby="publication-year-${year}">
            <h2 id="publication-year-${year}">${year}</h2>
            <div>${publicationsByYear[year].map(createPublicationHTML).join("")}</div>
          </section>`,
      )
      .join("");
  }

  function applyFilters() {
    const filteredPublications = allPublications.filter((publication) => {
      const matchesYear = currentYear === "all" || String(publication.year) === currentYear;
      const searchableText = [
        publication.title,
        publication.authors,
        publication.venue,
        publication.short,
        publication.year,
        publication.note || "",
      ]
        .join(" ")
        .toLowerCase();
      return matchesYear && searchableText.includes(currentSearch);
    });
    displayPublications(filteredPublications);
  }

  filterContainer.addEventListener("click", (event) => {
    const button = event.target.closest(".filter-btn");
    if (!button) return;
    currentYear = button.dataset.filterYear;
    filterContainer.querySelectorAll(".filter-btn").forEach((filter) => {
      filter.classList.toggle("active", filter === button);
    });
    applyFilters();
  });

  searchInput.addEventListener("input", (event) => {
    currentSearch = event.target.value.trim().toLowerCase();
    applyFilters();
  });

  createFilterButtons();
  displayPublications(allPublications);
});
