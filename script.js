const audio = document.querySelector("audio");
const audioButton = document.querySelector(".audio-button");
const logoDissolve = document.querySelector(".logo-dissolve");
const floatingNav = document.querySelector(".floating-nav");
const heroShowcase = document.querySelector(".hero-showcase");
const heroWorldDots = Array.from(document.querySelectorAll(".hero-world__dots circle"));
const heroWorldRoute = document.querySelector(".hero-world__route");

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
const featurePlayers = [];
let featureIntroStarted = false;
let featureIntroComplete = reduceMotion.matches;
let activeIntroIndex = 0;

function playNextFeatureIntro() {
  const player = featurePlayers[activeIntroIndex];

  if (!player) {
    featureIntroComplete = true;
    return;
  }

  player.play().catch(() => {
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

  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    revealVideo();
  } else {
    video.addEventListener("loadeddata", revealVideo, { once: true });
    video.addEventListener("error", revealVideo, { once: true });
  }

  const playFromStart = () => {
    if (!featureIntroComplete || reduceMotion.matches || !video.paused) return;
    video.currentTime = 0;
    video.play().catch(() => {});
  };

  const reset = () => {
    video.pause();
    video.currentTime = 0;
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

  featurePlayers.push({
    video,
    play: () => {
      video.currentTime = 0;
      return video.play();
    },
  });
});

const featuresSection = document.querySelector(".features");

if (featuresSection && !reduceMotion.matches) {
  const featureIntroObserver = new IntersectionObserver(
    (entries, observer) => {
      if (featureIntroStarted || !entries.some((entry) => entry.isIntersecting)) return;

      featureIntroStarted = true;
      observer.disconnect();
      playNextFeatureIntro();
    },
    {
      threshold: 0.25,
      rootMargin: "0px 0px -8%",
    },
  );

  featureIntroObserver.observe(featuresSection);
}

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

  summary.addEventListener("click", (event) => {
    event.preventDefault();
    const shouldOpen = !details.open || details.classList.contains("is-closing");

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
