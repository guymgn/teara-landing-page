// Knowledge Center pages: build "On this page" from the h2 headings, add heading links,
// and highlight the section currently in view.
(() => {
  const headings = [...document.querySelectorAll(".help-content h2[id]")];
  if (!headings.length) return;

  // A heading's own words, without status pills such as "Coming soon".
  const headingText = (heading) => {
    const copy = heading.cloneNode(true);
    copy.querySelectorAll(".help-pill").forEach((pill) => pill.remove());
    return copy.textContent.trim();
  };

  const lists = [...document.querySelectorAll("[data-help-toc]")];
  for (const list of lists) {
    for (const heading of headings) {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = `#${heading.id}`;
      link.textContent = headingText(heading);
      link.dataset.target = heading.id;
      item.append(link);
      list.append(item);
    }
  }

  for (const heading of headings) {
    const anchor = document.createElement("a");
    anchor.className = "help-anchor";
    anchor.href = `#${heading.id}`;
    anchor.setAttribute("aria-label", `Link to ${headingText(heading)}`);
    anchor.textContent = "#";
    heading.prepend(anchor);
  }

  // Close the mobile "On this page" panel after picking a section.
  for (const inline of document.querySelectorAll(".help-toc-inline")) {
    inline.addEventListener("click", (event) => {
      if (event.target.closest("a")) inline.open = false;
    });
  }

  const tocLinks = [...document.querySelectorAll(".help-toc a[data-target]")];
  if (!tocLinks.length) return;

  const setActive = (id) => {
    for (const link of tocLinks) {
      const active = link.dataset.target === id;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
  };

  const update = () => {
    const offset = Math.min(window.innerHeight * 0.35, 280);
    let current = headings[0].id;
    for (const heading of headings) {
      if (heading.getBoundingClientRect().top - offset <= 0) current = heading.id;
    }
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atBottom) current = headings[headings.length - 1].id;
    setActive(current);
  };

  let queued = false;
  window.addEventListener(
    "scroll",
    () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        update();
      });
    },
    { passive: true },
  );
  window.addEventListener("hashchange", update);
  update();
})();
