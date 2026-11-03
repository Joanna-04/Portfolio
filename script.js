/* Portfolio scripts. Each feature is its own function, started in init(). */
"use strict";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* 1. Mobile menu toggle (closes after a link is clicked) */
function initMenu() {
  const btn = $("#menuBtn");
  const links = $("#navLinks");
  btn.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    btn.setAttribute("aria-expanded", open);
  });
  links.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      links.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }
  });
}

/* 2. Dark / light theme, remembered with localStorage */
function initTheme() {
  const btn = $("#themeBtn");
  const apply = (theme) => {
    document.documentElement.dataset.theme = theme;
    btn.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} theme`);
    btn.innerHTML = theme === "dark" ? "&#9728;" : "&#9790;";
  };
  let saved = "dark";
  try {
    saved = localStorage.getItem("theme") ||
      "dark"; /* dark is the default look */
  } catch (err) { /* storage blocked: use default */ }
  apply(saved);
  btn.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    apply(next);
    try { localStorage.setItem("theme", next); } catch (err) { /* ignore */ }
  });
}

/* 3. Highlight the nav link of the section in view */
function initActiveNav() {
  const links = $$(".nav-links a");
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("main section").forEach((s) => obs.observe(s));
}

/* 4. Scroll reveal + 5. animated skill bars */
function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("visible");
      $$(".bar i", en.target).forEach((i) => (i.style.width = i.dataset.level + "%"));
      obs.unobserve(en.target);
    });
  }, { threshold: 0.15 });
  $$(".reveal").forEach((s) => obs.observe(s));
}

/* 6. Project filter */
function initFilter() {
  const chips = $$(".chip");
  chips.forEach((chip) => chip.addEventListener("click", () => {
    chips.forEach((c) => {
      c.classList.toggle("active", c === chip);
      c.setAttribute("aria-pressed", c === chip);
    });
    $$(".card").forEach((card) => {
      card.hidden = chip.dataset.filter !== "all" && card.dataset.category !== chip.dataset.filter;
    });
  }));
}

/* 7. Project details modal (uses the native <dialog> element) */
function initModal() {
  const modal = $("#modal");
  $$(".link-btn").forEach((btn) => btn.addEventListener("click", () => {
    $("#modalTitle").textContent = btn.closest(".card").querySelector("h3").textContent;
    $("#modalText").textContent = btn.dataset.details;
    const img = $("#modalImg");
if (btn.dataset.img) {
  img.src = btn.dataset.img;
  img.alt = btn.dataset.alt || "";
  img.hidden = false;
} else {
  img.hidden = true;
  img.removeAttribute("src");
}
    modal.showModal();
  }));
  $("#modalClose").addEventListener("click", () => modal.close());
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });
}

/* 8. Contact form validation + live character counter */
function initForm() {
  const form = $("#contactForm");
  const msg = $("#message");
  msg.addEventListener("input", () => ($("#count").textContent = `(${msg.value.length}/300)`));

  const rules = {
    name: (v) => (v.trim().length >= 2 ? "" : "Please enter your name."),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Please enter a valid email."),
    message: (v) => (v.trim().length >= 10 ? "" : "Message must be at least 10 characters.")
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    Object.keys(rules).forEach((id) => {
      const field = $("#" + id);
      const error = rules[id](field.value);
      $("#" + id + "Err").textContent = error;
      field.classList.toggle("invalid", Boolean(error));
      field.setAttribute("aria-invalid", Boolean(error));
      if (error) ok = false;
    });
    $("#formStatus").textContent = ok ? "Thanks! Your message is ready to send (front-end demo)." : "";
    if (ok) { form.reset(); $("#count").textContent = "(0/300)"; }
  });
}

/* 9. Scroll progress bar + 10. back-to-top button */
function initScrollUI() {
  const bar = $("#progress");
  const top = $("#toTop");
  window.addEventListener("scroll", () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + "%";
    top.hidden = scrollY < 400;
  }, { passive: true });
  top.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
}

/* 11. Footer year */
function initYear() { $("#year").textContent = new Date().getFullYear(); }

/* 10. Terminal lines appear one by one */
function initTerminal() {
  const pre = $(".terminal pre");
  if (!pre || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const lines = pre.innerHTML.split("\n");
  pre.innerHTML = "";
  let i = 0;
  const timer = setInterval(() => {
    pre.innerHTML += (i ? "\n" : "") + lines[i++];
    if (i >= lines.length) clearInterval(timer);
  }, 450);
}

/* 10. Photo carousel with arrows and dots */
function initCarousel() {
  const box = $(".carousel");
  if (!box) return;
  const slides = $$(".slide", box);
  const dotsBox = $(".dots", box);
  let current = 0;

  const dots = slides.map((_, n) => {
    const dot = document.createElement("button");
    dot.className = "dot";
    dot.setAttribute("aria-label", `Show photo ${n + 1} of ${slides.length}`);
    dot.addEventListener("click", () => show(n));
    dotsBox.appendChild(dot);
    return dot;
  });

  function show(n) {
    current = (n + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle("active", k === current));
    dots.forEach((d, k) => d.classList.toggle("on", k === current));
  }

  $(".prev", box).addEventListener("click", () => show(current - 1));
  $(".next", box).addEventListener("click", () => show(current + 1));
    let startX = 0;
  box.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener("touchend", (e) => {
    const diff = e.changedTouches[0].clientX - startX;
    if (Math.abs(diff) > 40) show(current + (diff < 0 ? 1 : -1));
  });
  show(0);
}

function init() {
  [initMenu, initTheme, initActiveNav, initReveal, initTerminal, initCarousel,
   initFilter, initModal, initForm, initScrollUI, initYear].forEach((fn) => {
    try { fn(); } catch (err) { console.warn(`${fn.name} failed:`, err); }
  });
}
document.addEventListener("DOMContentLoaded", init);