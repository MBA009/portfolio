// ---- Config -------------------------------------------------
// Timezone shown in the footer clock (IANA name).
const TIMEZONE = "America/New_York";

const $ = (id) => document.getElementById(id);

// ---- Theme toggle -------------------------------------------
const root = document.documentElement;

function currentTheme() {
  const set = root.getAttribute("data-theme");
  if (set) return set;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

$("themeToggle")?.addEventListener("click", () => {
  const next = currentTheme() === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  try { localStorage.setItem("theme", next); } catch (e) {}
});

// ---- Years --------------------------------------------------
const year = new Date().getFullYear();
["yearNow", "yearFoot"].forEach((id) => { if ($(id)) $(id).textContent = year; });

// ---- Clock --------------------------------------------------
const clock = $("clock");
if (clock) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TIMEZONE, timeZoneName: "short",
  });
  const tick = () => { clock.textContent = fmt.format(new Date()); };
  tick();
  setInterval(tick, 15000);
}

// ---- Copy email ---------------------------------------------
document.querySelectorAll("[data-copy]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      btn.textContent = "Copied";
    } catch (e) {
      btn.textContent = "Failed";
    }
    setTimeout(() => (btn.textContent = "Copy"), 1600);
  });
});

// ---- Scroll reveal ------------------------------------------
const items = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  items.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 60}ms`;
    io.observe(el);
  });
} else {
  items.forEach((el) => el.classList.add("in"));
}

// ---- Project media ------------------------------------------
// <figure class="media" data-media="../assets/projects/x/01"> looks for
// 01.webp/.png/.jpg/.jpeg/.gif/.avif/.mp4/.webm and shows the first one found.
// data-media can also include an extension, or use data-youtube="VIDEO_ID".
// Missing media shows a placeholder locally and is hidden on the live site.
const IMAGE_EXT = ["webp", "png", "jpg", "jpeg", "gif", "avif"];
const VIDEO_EXT = ["mp4", "webm"];
const isLocal =
  location.protocol === "file:" || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

function probeImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function probeVideo(url) {
  return new Promise((resolve, reject) => {
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => resolve(v);
    v.onerror = reject;
    v.src = url;
  });
}

const isVideo = (url) => /\.(mp4|webm)$/i.test(url);

async function findMedia(base) {
  const hasExt = /\.[a-z0-9]+$/i.test(base.split("/").pop());
  const urls = hasExt ? [base] : [...IMAGE_EXT, ...VIDEO_EXT].map((e) => `${base}.${e}`);
  const results = await Promise.allSettled(urls.map((u) => (isVideo(u) ? probeVideo(u) : probeImage(u))));
  const hit = results.findIndex((r) => r.status === "fulfilled");
  return hit === -1 ? null : results[hit].value;
}

let lightbox;
function openLightbox(src, alt) {
  if (!lightbox) {
    lightbox = document.createElement("dialog");
    lightbox.className = "lightbox";
    lightbox.innerHTML = "<img alt=''>";
    lightbox.addEventListener("click", () => lightbox.close());
    document.body.appendChild(lightbox);
  }
  const img = lightbox.querySelector("img");
  img.src = src;
  img.alt = alt;
  lightbox.showModal();
}

async function loadFigure(fig) {
  const frame = fig.querySelector(".media-frame");
  const caption = fig.querySelector("figcaption")?.textContent.trim() || "";

  if (fig.dataset.youtube) {
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube-nocookie.com/embed/${fig.dataset.youtube}`;
    iframe.title = caption || "Video";
    iframe.allow = "accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen";
    iframe.loading = "lazy";
    frame.replaceChildren(iframe);
    fig.classList.add("media-ready");
    return true;
  }

  const el = await findMedia(fig.dataset.media);
  if (el) {
    if (el.tagName === "VIDEO") {
      el.controls = true;
      el.playsInline = true;
      if ("autoplay" in fig.dataset) {
        el.muted = true;
        el.loop = true;
        el.autoplay = true;
      }
    } else {
      el.alt = caption;
      el.addEventListener("click", () => openLightbox(el.src, el.alt));
    }
    frame.replaceChildren(el);
    fig.classList.add("media-ready");
    return true;
  }

  if (isLocal) {
    const parts = fig.dataset.media.split("/");
    const name = parts.pop();
    fig.classList.add("media-empty");
    frame.innerHTML = `<span>Add <b>${name}.png / .jpg / .mp4</b><br>to ${parts.join("/").replace(/^(\.\.\/)+/, "")}/</span>`;
    return true;
  }
  fig.remove();
  return false;
}

document.querySelectorAll("[data-media-section]").forEach(async (section) => {
  const figs = [...section.querySelectorAll(".media")];
  const shown = await Promise.all(figs.map(loadFigure));
  if (!shown.some(Boolean)) section.hidden = true;
});
