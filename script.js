(() => {
  const root = document.documentElement;
  root.classList.add("js");

  const scribbles = [...document.querySelectorAll("[data-scribble]")];
  scribbles.forEach((target) => {
    if (target.querySelector("svg")) return;

    const type = target.getAttribute("data-scribble");
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    const path = document.createElementNS(svgNS, "path");
    svg.classList.add("ink-svg");
    path.classList.add("ink-path");

    if (type === "underline") {
      svg.setAttribute("viewBox", "0 0 120 24");
      path.setAttribute("d", "M4 16 C22 13, 42 14, 60 15 C78 16, 97 14, 116 13");
    } else {
      svg.setAttribute("viewBox", "0 0 140 58");
      path.setAttribute(
        "d",
        "M10 30 C12 12, 48 4, 90 6 C120 7, 134 16, 132 30 C130 46, 100 54, 60 53 C30 52, 10 43, 10 30 Z",
      );
    }

    svg.appendChild(path);
    target.appendChild(svg);
    const length = path.getTotalLength();
    path.style.strokeDasharray = String(length);
    path.style.strokeDashoffset = String(length);
  });

  requestAnimationFrame(() => {
    root.classList.add("page-ready");
  });

  document.querySelectorAll("#year,[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  const progress = document.createElement("div");
  progress.className = "progress-bar";
  document.body.appendChild(progress);

  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const width = scrollable > 0 ? (scrollTop / scrollable) * 100 : 0;
    progress.style.width = `${Math.min(100, Math.max(0, width))}%`;
  };

  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);

  const revealTargets = [...document.querySelectorAll(".reveal")];
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -10% 0px" },
    );
    revealTargets.forEach((target) => revealObserver.observe(target));
  } else {
    revealTargets.forEach((target) => target.classList.add("is-visible"));
  }

  const nav = document.querySelector(".site-nav");
  const toggle = document.querySelector(".menu-toggle");
  if (nav && toggle) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 1060) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      let raf = null;

      const reset = () => {
        card.style.transform = "translate3d(0,0,0) rotateX(0deg) rotateY(0deg)";
      };

      card.addEventListener("pointermove", (event) => {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const px = (event.clientX - rect.left) / rect.width;
          const py = (event.clientY - rect.top) / rect.height;
          const rx = (0.5 - py) * 5.5;
          const ry = (px - 0.5) * 6.5;
          card.style.transform = `translate3d(0,-2px,0) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
        });
      });

      card.addEventListener("pointerleave", reset);
      card.addEventListener("pointerup", reset);
    });

    document.querySelectorAll("[data-magnetic]").forEach((button) => {
      button.addEventListener("pointermove", (event) => {
        const rect = button.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 6;
        button.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      });

      button.addEventListener("pointerleave", () => {
        button.style.transform = "translate(0,0)";
      });
    });
  }

  const countElements = [...document.querySelectorAll("[data-count]")];
  const runCount = (el) => {
    const target = Number(el.dataset.count || "0");
    const duration = 900;
    const start = performance.now();

    const tick = (now) => {
      const progressPct = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progressPct, 3);
      el.textContent = Math.round(target * eased).toString();
      if (progressPct < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  if (countElements.length) {
    const countObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCount(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 },
    );

    countElements.forEach((el) => countObserver.observe(el));
  }

  const searchInput = document.querySelector("[data-blog-search]");
  const blogCards = [...document.querySelectorAll("[data-blog-card]")];
  const emptyState = document.querySelector("[data-blog-empty]");

  if (searchInput && blogCards.length) {
    const filterCards = () => {
      const query = searchInput.value.trim().toLowerCase();
      let visible = 0;

      blogCards.forEach((card) => {
        const haystack = (card.dataset.search || "").toLowerCase();
        const show = haystack.includes(query);
        card.style.display = show ? "block" : "none";
        if (show) visible += 1;
      });

      if (emptyState) {
        emptyState.hidden = visible > 0;
      }
    };

    searchInput.addEventListener("input", filterCards);
    filterCards();
  }

  const contactForm = document.querySelector("[data-contact-form]");
  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(contactForm);
      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const company = String(formData.get("company") || "").trim();
      const budget = String(formData.get("budget") || "").trim();
      const message = String(formData.get("message") || "").trim();

      const subject = encodeURIComponent(`Website enquiry from ${name || "new lead"}`);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\nCompany: ${company}\nBudget: ${budget}\n\nProject goals:\n${message}`,
      );

      window.location.href = `mailto:hello@thatotheragency.co.uk?subject=${subject}&body=${body}`;
    });
  }

  const toTop = document.createElement("button");
  toTop.className = "to-top";
  toTop.type = "button";
  toTop.setAttribute("aria-label", "Back to top");
  toTop.textContent = "Top";
  document.body.appendChild(toTop);

  const toggleTop = () => {
    toTop.classList.toggle("show", window.scrollY > 520);
  };

  toggleTop();
  window.addEventListener("scroll", toggleTop, { passive: true });

  toTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("pointermove", (event) => {
    root.style.setProperty("--mouse-x", `${event.clientX}px`);
    root.style.setProperty("--mouse-y", `${event.clientY}px`);
  });
})();
