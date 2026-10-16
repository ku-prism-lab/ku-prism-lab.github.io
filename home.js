// Fills the "Recent papers" list on the home page from publications-data.js,
// so a paper added there shows up here without editing index.html.
document.addEventListener("DOMContentLoaded", () => {
  const list = document.querySelector("[data-recent-papers]");
  if (!list || !window.publicationsData) return;

  const count = Number(list.dataset.count) || 6;
  const papers = window.publicationsData.filter((paper) => paper.image).slice(0, count);

  const escapeHTML = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  list.innerHTML = papers
    .map((paper) => {
      const url = paper.links[0]?.[1];
      const title = escapeHTML(paper.title);
      const titleHTML = url
        ? `<a href="${escapeHTML(url)}" target="_blank" rel="noreferrer">${title}</a>`
        : title;
      return `
        <li class="paper">
          <div class="paper-figure"><img src="${escapeHTML(paper.image)}" alt="" loading="lazy"></div>
          <p class="paper-venue">${escapeHTML(paper.short)} ${paper.year}</p>
          <h3 class="paper-title">${titleHTML}</h3>
          <p class="paper-authors">${escapeHTML(paper.authors)}</p>
        </li>`;
    })
    .join("");
});
