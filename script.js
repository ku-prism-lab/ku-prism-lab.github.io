const toggle = document.querySelector(".nav-toggle");
const menu = document.querySelector(".nav-menu");

if (toggle && menu) {
  const closeMenu = () => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
    menu.classList.remove("open");
  };

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
    menu.classList.toggle("open", !isOpen);
  });

  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) closeMenu();
  });
}

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

// Research teaser videos: load and play only while on screen; reduced motion
// keeps the poster until the viewer presses play.
const researchVideos = document.querySelectorAll("video[data-autoplay]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (researchVideos.length) {
  const loadVideo = (video) => {
    const sources = video.querySelectorAll("source[data-src]");
    if (!sources.length) return;
    sources.forEach((source) => {
      source.src = source.dataset.src;
      source.removeAttribute("data-src");
    });
    video.load();
  };

  const autoplay = !prefersReducedMotion.matches && "IntersectionObserver" in window;

  researchVideos.forEach((video) => {
    const button = video.parentElement.querySelector(".media-toggle");
    if (!button) return;
    const sync = () => {
      button.classList.toggle("is-paused", video.paused);
      button.setAttribute("aria-label", video.paused ? "Play video" : "Pause video");
    };
    video.addEventListener("play", sync);
    video.addEventListener("pause", sync);
    button.addEventListener("click", () => {
      loadVideo(video);
      if (video.paused) {
        delete video.dataset.userPaused;
        video.play().catch(() => {});
      } else {
        video.dataset.userPaused = "true";
        video.pause();
      }
    });
    button.hidden = false;
    sync();
  });

  if (autoplay) {
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target: video, isIntersecting }) => {
          if (isIntersecting) {
            loadVideo(video);
            if (!video.dataset.userPaused) video.play().catch(() => {});
          } else if (!video.paused) {
            video.pause();
          }
        });
      },
      { threshold: 0.35 },
    );
    researchVideos.forEach((video) => videoObserver.observe(video));
  }
}
