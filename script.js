const audio = document.querySelector("audio");
const audioButton = document.querySelector(".audio-button");
const logoDissolve = document.querySelector(".logo-dissolve");
const floatingNav = document.querySelector(".floating-nav");
const heroShowcase = document.querySelector(".hero-showcase");
const heroWorldDots = Array.from(document.querySelectorAll(".hero-world__dots circle"));
const heroWorldRoute = document.querySelector(".hero-world__route");
const themeColor = document.querySelector('meta[name="theme-color"]');
const colorSchemePreference = window.matchMedia("(prefers-color-scheme: dark)");

function applyTheme(isDark) {
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
  themeColor?.setAttribute("content", isDark ? "#101116" : "#ffffff");
}

applyTheme(colorSchemePreference.matches);
colorSchemePreference.addEventListener("change", (event) => applyTheme(event.matches));

if (heroWorldDots.length > 1 && heroWorldRoute && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let lastDestination = heroWorldDots[0];

  const animateWorldRoute = () => {
    const origins = heroWorldDots.filter((dot) => dot !== lastDestination);
    const origin = origins[Math.floor(Math.random() * origins.length)];
    const destinations = heroWorldDots.filter((dot) => dot !== origin);
    const destination = destinations[Math.floor(Math.random() * destinations.length)];
    const startX = Number(origin.getAttribute("cx"));
    const startY = Number(origin.getAttribute("cy"));
    const endX = Number(destination.getAttribute("cx"));
    const endY = Number(destination.getAttribute("cy"));
    const midpointX = (startX + endX) / 2;
    const midpointY = Math.min(startY, endY) - Math.max(34, Math.abs(endX - startX) * 0.16);

    heroWorldRoute.setAttribute("d", `M${startX} ${startY} Q${midpointX} ${midpointY} ${endX} ${endY}`);
    heroWorldRoute.classList.remove("is-active");
    origin.classList.remove("is-active");
    destination.classList.remove("is-active");
    void heroWorldRoute.getBoundingClientRect();
    heroWorldRoute.classList.add("is-active");
    origin.classList.add("is-active");
    destination.classList.add("is-active");
    lastDestination = destination;

    window.setTimeout(() => {
      heroWorldRoute.classList.remove("is-active");
      origin.classList.remove("is-active");
      destination.classList.remove("is-active");
    }, 2600);

    window.setTimeout(animateWorldRoute, 3100);
  };

  window.setTimeout(animateWorldRoute, 900);
}

document.documentElement.classList.add("has-js");

if (logoDissolve) {
  const columns = 29;
  const rows = 8;

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const cell = document.createElement("span");
      const distanceFromEdge = Math.min(column, columns - 1 - column);
      const sweep = distanceFromEdge / Math.floor(columns / 2);
      const checkerPhase = (column + row) % 2;
      cell.className = "logo-dissolve__cell";
      cell.style.setProperty(
        "--cell-delay",
        `${0.18 + sweep * 0.3 + checkerPhase * 0.07}s`,
      );
      logoDissolve.append(cell);
    }
  }
}

const siteFooter = document.querySelector(".site-footer");
const footerContent = document.querySelector(".site-footer__content");
let footerFrame;

function updateFooterReveal() {
  footerFrame = undefined;
  if (!siteFooter || !footerContent) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    siteFooter.style.setProperty("--footer-reveal", "1");
    siteFooter.style.setProperty("--footer-shift", "0px");
    siteFooter.style.setProperty("--footer-mask-stop", "46%");
    siteFooter.style.setProperty("--footer-content-opacity", "1");
    siteFooter.style.setProperty("--footer-content-shift", "0px");
    return;
  }

  const rect = siteFooter.getBoundingClientRect();
  const start = window.innerHeight * 0.94;
  const end = window.innerHeight * 0.28;
  const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
  const eased = progress * progress * (3 - 2 * progress);
  const contentProgress = Math.min(1, Math.max(0, (progress - 0.48) / 0.52));

  siteFooter.style.setProperty("--footer-reveal", eased.toFixed(3));
  siteFooter.style.setProperty("--footer-shift", `${(1 - eased) * 14}px`);
  siteFooter.style.setProperty("--footer-mask-stop", `${104 - eased * 58}%`);
  siteFooter.style.setProperty("--footer-content-opacity", contentProgress.toFixed(3));
  siteFooter.style.setProperty("--footer-content-shift", `${(1 - contentProgress) * 8}px`);
}

function requestFooterReveal() {
  if (footerFrame) return;
  footerFrame = requestAnimationFrame(updateFooterReveal);
}

window.addEventListener("scroll", requestFooterReveal, { passive: true });
window.addEventListener("resize", requestFooterReveal);
updateFooterReveal();

let navFrame;

function updateFloatingNav() {
  navFrame = undefined;
  if (!heroShowcase || !floatingNav) return;
  const heroHasPassed = heroShowcase.getBoundingClientRect().bottom < 96;
  floatingNav.classList.toggle("is-visible", heroHasPassed);
}

window.addEventListener(
  "scroll",
  () => {
    if (navFrame) return;
    navFrame = requestAnimationFrame(updateFloatingNav);
  },
  { passive: true },
);

updateFloatingNav();

const sectionObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-revealed");
      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.12,
    rootMargin: "0px 0px -10%",
  },
);

document.querySelectorAll(".section-reveal").forEach((section) => {
  sectionObserver.observe(section);
});

const featureVideos = document.querySelectorAll(".feature-story video");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let featureIntroComplete = reduceMotion.matches;
let activeIntroIndex = 0;

function playNextFeatureIntro() {
  const video = featureVideos[activeIntroIndex];
  if (!video || reduceMotion.matches) {
    featureIntroComplete = true;
    return;
  }
  video.currentTime = 0;
  video.play().catch(() => {
    activeIntroIndex += 1;
    playNextFeatureIntro();
  });
}

featureVideos.forEach((video) => {
  const media = video.closest(".feature-story__media");
  const story = video.closest(".feature-story");
  video.muted = true;
  video.playbackRate = 1;

  const revealVideo = () => {
    media.classList.remove("is-loading");
    media.classList.add("is-ready");
    media.setAttribute("aria-busy", "false");
  };

  // Videos marked data-rest="end" sit on their last frame when idle, so a
  // story that builds up from an empty screen never rests on that empty frame.
  const restsAtEnd = video.dataset.rest === "end";
  const restTime = () => (restsAtEnd && Number.isFinite(video.duration) ? Math.max(0, video.duration - 1 / 60) : 0);
  const showRestFrame = () => {
    if (!restsAtEnd) return revealVideo();
    video.addEventListener("seeked", revealVideo, { once: true });
    video.currentTime = restTime();
  };

  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    showRestFrame();
  } else {
    video.addEventListener("loadeddata", showRestFrame, { once: true });
    video.addEventListener("error", revealVideo, { once: true });
  }

  const playFromStart = () => {
    if (!featureIntroComplete || reduceMotion.matches || !video.paused) return;
    video.currentTime = 0;
    video.play().catch(() => {});
  };

  const reset = () => {
    video.pause();
    video.currentTime = restTime();
  };

  story.addEventListener("pointerenter", playFromStart);
  story.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse") playFromStart();
  });
  media.addEventListener("focus", playFromStart);
  media.addEventListener("click", playFromStart);
  video.addEventListener("ended", () => {
    reset();
    if (!featureIntroComplete) {
      activeIntroIndex += 1;
      playNextFeatureIntro();
    }
  });
});

if (featureVideos.length && !reduceMotion.matches) {
  const introObserver = new IntersectionObserver((entries, observer) => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    observer.disconnect();
    playNextFeatureIntro();
  }, { threshold: 0.5 });
  introObserver.observe(featureVideos[0].closest(".feature-story__media"));
}

const faqPanels = new Map();
document.querySelectorAll(".faq details").forEach((details) => {
  const summary = details.querySelector("summary");
  const answer = details.querySelector("p");
  let animation;
  let answerAnimation;

  const finish = (shouldOpen) => {
    answerAnimation?.cancel();
    details.open = shouldOpen;
    details.classList.remove("is-animating", "is-closing");
    details.style.removeProperty("height");
    animation = undefined;
    answerAnimation = undefined;
  };

  const setOpen = (shouldOpen) => {
    animation?.cancel();
    answerAnimation?.cancel();

    if (reduceMotion.matches) {
      finish(shouldOpen);
      return;
    }

    const startHeight = details.offsetHeight;

    if (shouldOpen) {
      details.open = true;
      details.classList.remove("is-closing");
    } else {
      details.classList.add("is-closing");
    }

    const endHeight = shouldOpen ? details.scrollHeight : summary.offsetHeight;
    details.classList.add("is-animating");
    details.style.height = `${endHeight}px`;

    animation = details.animate(
      [
        { height: `${startHeight}px` },
        { height: `${endHeight}px` },
      ],
      {
        duration: shouldOpen ? 420 : 320,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    );

    answerAnimation = answer.animate(
      shouldOpen
        ? [
            { opacity: 0, transform: "translateY(-6px)" },
            { opacity: 1, transform: "translateY(0)" },
          ]
        : [
            { opacity: 1, transform: "translateY(0)" },
            { opacity: 0, transform: "translateY(-4px)" },
          ],
      {
        duration: shouldOpen ? 340 : 200,
        delay: shouldOpen ? 45 : 0,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "both",
      },
    );

    animation.onfinish = () => finish(shouldOpen);
    animation.oncancel = () => {
      details.style.removeProperty("height");
      details.classList.remove("is-animating");
    };
  };

  faqPanels.set(details, setOpen);
  summary.addEventListener("click", (event) => {
    event.preventDefault();
    const shouldOpen = !details.open || details.classList.contains("is-closing");
    if (shouldOpen) {
      faqPanels.forEach((toggle, panel) => {
        if (panel !== details && panel.open && !panel.classList.contains("is-closing")) {
          toggle(false);
        }
      });
    }
    setOpen(shouldOpen);
  });
});

function setPlaying(isPlaying) {
  audioButton.classList.toggle("is-playing", isPlaying);
  audioButton.setAttribute("aria-pressed", String(isPlaying));
  audioButton.setAttribute(
    "aria-label",
    isPlaying
      ? "Pause the pronunciation of Teara"
      : "Play the pronunciation of Teara",
  );
}

audioButton.addEventListener("click", async () => {
  if (audio.paused) {
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  } else {
    audio.pause();
    setPlaying(false);
  }
});

audio.addEventListener("ended", () => {
  audio.currentTime = 0;
  setPlaying(false);
});

audio.addEventListener("pause", () => setPlaying(false));

// Keep all features in the HTML; progressively limit board previews to five.
(() => {
  const drawer = document.querySelector('#roadmap-drawer');
  if (!drawer || typeof drawer.showModal !== 'function') return;
  const columns = new Map();
  const descriptions = {
    todo: 'Ideas and improvements planned for Teara.',
    progress: 'Features currently being worked on.',
    done: 'Features already built into Teara.',
  };
  let opener;
  document.querySelectorAll('[data-roadmap-column]').forEach(column => {
    // Cards switched off with a feature flag (see index.html) don't count or show in the drawer.
    const cards = [...column.querySelectorAll('.roadmap-card')].filter(card => getComputedStyle(card).display !== 'none');
    const count = column.querySelector('.roadmap-count');
    if (count) count.textContent = cards.length;
    columns.set(column.dataset.roadmapColumn, { column, cards });
    cards.slice(5).forEach(card => { card.hidden = true; });
    column.querySelector('.roadmap-more').hidden = cards.length <= 5 && column.dataset.roadmapColumn !== 'done';
  });
  document.querySelectorAll('[data-roadmap-open]').forEach(button => {
    button.addEventListener('click', () => {
      const key = button.dataset.roadmapOpen;
      const { column, cards } = columns.get(key);
      opener = button;
      drawer.querySelector('#roadmap-drawer-title').textContent = column.querySelector('.roadmap-column__heading span').textContent;
      drawer.querySelector('#roadmap-drawer-description').textContent = `${descriptions[key]} ${cards.length} features.`;
      drawer.querySelector('.roadmap-drawer__cards').replaceChildren(...cards.map(card => {
        const copy = card.cloneNode(true);
        copy.hidden = false;
        return copy;
      }));
      drawer.showModal();
      drawer.scrollTop = 0;
      document.documentElement.classList.add('roadmap-drawer-open');
    });
  });
  let closing = false;
  async function closeDrawer() {
    if (!drawer.open || closing) return;
    closing = true;
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      drawer.classList.add('is-closing');
      const exit = drawer.animate(
        [{ transform: 'translateX(0)' }, { transform: 'translateX(100%)' }],
        { duration: 220, easing: 'ease-in', fill: 'forwards' },
      );
      // Cancellation also completes dismissal, so the dialog cannot get stuck.
      await exit.finished.catch(() => {});
      drawer.close();
      exit.cancel();
    } else {
      drawer.close();
    }
    drawer.classList.remove('is-closing');
    closing = false;
  }
  drawer.querySelector('.roadmap-drawer__close').addEventListener('click', closeDrawer);
  drawer.addEventListener('cancel', event => {
    event.preventDefault();
    closeDrawer();
  });
  let backdropPress = false;
  drawer.addEventListener('pointerdown', event => {
    const bounds = drawer.getBoundingClientRect();
    backdropPress = event.target === drawer && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom);
  });
  drawer.addEventListener('click', event => {
    const bounds = drawer.getBoundingClientRect();
    if (backdropPress && event.target === drawer && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) closeDrawer();
    backdropPress = false;
  });
  drawer.addEventListener('close', () => {
    document.documentElement.classList.remove('roadmap-drawer-open');
    opener?.focus();
  });
})();
