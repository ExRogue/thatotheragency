(() => {
  const root = document.documentElement;
  root.classList.add("js");

  const setYear = () => {
    document.querySelectorAll("#year,[data-year]").forEach((el) => {
      el.textContent = String(new Date().getFullYear());
    });
  };

  const initProgressBar = () => {
    const bar = document.createElement("div");
    bar.className = "progress-bar";
    document.body.appendChild(bar);

    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
      bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  };

  const initReveal = () => {
    const targets = [...document.querySelectorAll(".reveal")];
    if (!targets.length) return;

    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, io) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -10% 0px" },
    );

    targets.forEach((el) => observer.observe(el));
  };

  const initMenu = () => {
    const nav = document.querySelector(".site-nav");
    const toggle = document.querySelector(".menu-toggle");
    if (!nav || !toggle) return;

    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  };

  const initInk = () => {
    const marks = [...document.querySelectorAll("[data-scribble]")];
    if (!marks.length) return;

    const svgNS = "http://www.w3.org/2000/svg";

    marks.forEach((el) => {
      if (el.querySelector("svg")) return;

      const type = el.getAttribute("data-scribble");
      const box = el.getBoundingClientRect();
      const isCircle = type === "circle";
      const padX = isCircle ? 7 : 8;
      const padY = isCircle ? 6 : 5;
      const width = Math.max(44, Math.ceil(box.width + padX * 2));
      const height = Math.max(22, Math.ceil(box.height + padY * 2));

      const svg = document.createElementNS(svgNS, "svg");
      const path = document.createElementNS(svgNS, "path");

      svg.classList.add("ink-svg");
      path.classList.add("ink-path", "draw");

      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      svg.setAttribute("width", String(width));
      svg.setAttribute("height", String(height));

      if (!isCircle) {
        svg.style.left = `${-padX}px`;
        svg.style.bottom = "0.02em";

        const y = Math.max(8, height - 6);
        const c1 = Math.round(width * 0.2);
        const c2 = Math.round(width * 0.42);
        const c3 = Math.round(width * 0.64);
        const c4 = Math.round(width * 0.82);

        path.setAttribute(
          "d",
          `M 3 ${y - 2} C ${c1} ${y - 7}, ${c2} ${y + 4}, ${Math.round(width * 0.52)} ${y - 1} C ${c3} ${y - 5}, ${c4} ${y + 2}, ${width - 4} ${y - 3}`,
        );
      } else {
        svg.style.left = `${-padX}px`;
        svg.style.top = `${-padY}px`;

        const left = 3;
        const right = width - 3;
        const top = 3;
        const bottom = height - 3;
        const mid = height / 2;

        path.setAttribute(
          "d",
          `M ${left} ${mid} C ${left + 6} ${top}, ${right - 18} ${top - 0.5}, ${right} ${mid - 0.8} C ${right - 6} ${bottom + 0.4}, ${left + 16} ${bottom + 0.5}, ${left} ${mid}`,
        );
      }

      svg.appendChild(path);
      el.appendChild(svg);

      const len = path.getTotalLength();
      path.style.strokeDasharray = String(len);
      path.style.strokeDashoffset = String(len);
      path.style.setProperty("--dash-len", String(len));
    });

    requestAnimationFrame(() => root.classList.add("page-ready"));
  };

  const initTilt = () => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

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
          const rotateX = (0.5 - py) * 4.8;
          const rotateY = (px - 0.5) * 5.6;
          card.style.transform = `translate3d(0,-2px,0) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
        });
      });

      card.addEventListener("pointerleave", reset);
      card.addEventListener("pointerup", reset);
    });

    document.querySelectorAll("[data-magnetic]").forEach((btn) => {
      btn.addEventListener("pointermove", (event) => {
        const rect = btn.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 6;
        btn.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      });

      btn.addEventListener("pointerleave", () => {
        btn.style.transform = "translate(0,0)";
      });
    });
  };

  const initCounters = () => {
    const items = [...document.querySelectorAll("[data-count]")];
    if (!items.length || !("IntersectionObserver" in window)) return;

    const run = (el) => {
      const target = Number(el.dataset.count || "0");
      const start = performance.now();
      const duration = 950;

      const tick = (now) => {
        const pct = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - pct, 3);
        el.textContent = String(Math.round(target * eased));
        if (pct < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries, io) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            run(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 },
    );

    items.forEach((el) => observer.observe(el));
  };

  const initBlogSearch = () => {
    const input = document.querySelector("[data-blog-search]");
    const cards = [...document.querySelectorAll("[data-blog-card]")];
    const empty = document.querySelector("[data-blog-empty]");
    if (!input || !cards.length) return;

    const filter = () => {
      const query = input.value.trim().toLowerCase();
      let visible = 0;

      cards.forEach((card) => {
        const text = (card.dataset.search || "").toLowerCase();
        const show = text.includes(query);
        card.style.display = show ? "block" : "none";
        if (show) visible += 1;
      });

      if (empty) empty.hidden = visible > 0;
    };

    input.addEventListener("input", filter);
    filter();
  };

  const initContactForm = () => {
    const form = document.querySelector("[data-contact-form]");
    if (!form) return;

    const status = form.querySelector("[data-form-status]");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const action = form.getAttribute("action");
      if (!action) {
        if (status) {
          status.className = "form-status err";
          status.textContent = "Form endpoint missing. Please add your Formsubmit endpoint.";
        }
        return;
      }

      const formData = new FormData(form);

      if (status) {
        status.className = "form-status";
        status.textContent = "Sending your message...";
      }

      try {
        const response = await fetch(action, {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) throw new Error("Send failed");

        form.reset();
        if (status) {
          status.className = "form-status ok";
          status.textContent = "Thanks, your message has been sent. We will get back within one business day.";
        }
      } catch (error) {
        if (status) {
          status.className = "form-status err";
          status.textContent = "Submission failed. Please email hello@thatotheragency.co.uk directly.";
        }
      }
    });
  };

  const initToTop = () => {
    const button = document.createElement("button");
    button.className = "to-top";
    button.type = "button";
    button.textContent = "Top";
    button.setAttribute("aria-label", "Back to top");
    document.body.appendChild(button);

    const update = () => {
      button.classList.toggle("show", window.scrollY > 540);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });

    button.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const initSpotlight = () => {
    window.addEventListener("pointermove", (event) => {
      root.style.setProperty("--mouse-x", `${event.clientX}px`);
      root.style.setProperty("--mouse-y", `${event.clientY}px`);
    });
  };

  setYear();
  initProgressBar();
  initReveal();
  initMenu();
  initInk();
  initTilt();
  initCounters();
  initBlogSearch();
  initContactForm();
  initToTop();
  initSpotlight();
})();
