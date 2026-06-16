/* Chroma — random color palette generator
   Framework-free. Generates harmonious 5-color palettes you can lock & copy. */

const SWATCH_COUNT = 5;
const paletteEl = document.getElementById("palette");
const generateBtn = document.getElementById("generateBtn");
const toastEl = document.getElementById("toast");
const chips = [...document.querySelectorAll(".harmony-chip")];

let mode = "auto";
// Each slot: { hex, locked }
let slots = Array.from({ length: SWATCH_COUNT }, () => ({ hex: null, locked: false }));

/* ---------- Color math ---------- */
function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x) => Math.round(255 * x).toString(16).padStart(2, "0");
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`.toUpperCase();
}

// Relative luminance → pick black or white text for readable contrast
function readableText(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return L > 0.45 ? "#111111" : "#ffffff";
}

const rand = (min, max) => Math.random() * (max - min) + min;
const wrap = (h) => ((h % 360) + 360) % 360;

/* ---------- Harmony generators ----------
   Each returns an array of 5 hex strings based on a random base hue. */
function buildPalette(style) {
  const base = rand(0, 360);
  const pick = style === "auto"
    ? ["analogous", "complementary", "triadic", "mono"][Math.floor(rand(0, 4))]
    : style;

  const hues = [];
  switch (pick) {
    case "complementary":
      hues.push(base, base + 12, base + 180, base + 192, base + 200);
      break;
    case "triadic":
      hues.push(base, base + 120, base + 240, base + 12, base + 132);
      break;
    case "mono":
      for (let i = 0; i < 5; i++) hues.push(base + rand(-8, 8));
      break;
    case "analogous":
    default:
      hues.push(base - 40, base - 20, base, base + 20, base + 40);
      break;
  }

  return hues.map((h, i) => {
    if (pick === "mono") {
      // vary lightness across a single hue for a tonal ramp
      const l = 22 + i * 15 + rand(-4, 4);
      return hslToHex(wrap(h), rand(45, 70), l);
    }
    const s = rand(58, 82);
    const l = rand(45, 68);
    return hslToHex(wrap(h), s, l);
  });
}

/* ---------- Render ---------- */
function generate(animate = true) {
  const fresh = buildPalette(mode);
  slots = slots.map((slot, i) => (slot.locked ? slot : { hex: fresh[i], locked: false }));
  render(animate);
}

function render(animate) {
  paletteEl.innerHTML = "";
  slots.forEach((slot, i) => {
    const text = readableText(slot.hex);
    const sw = document.createElement("div");
    sw.className = "swatch" + (slot.locked ? " locked" : "") + (animate ? " enter" : "");
    sw.style.background = slot.hex;
    sw.style.color = text;
    sw.style.animationDelay = `${i * 60}ms`;
    sw.setAttribute("role", "button");
    sw.setAttribute("tabindex", "0");
    sw.setAttribute("aria-label", `Color ${slot.hex}. Click to copy.`);

    sw.innerHTML = `
      <div class="swatch__inner">
        <div class="swatch__actions">
          <button class="icon-btn lock-btn" title="Lock this color" aria-label="Lock color">
            <svg class="lock-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0"/></svg>
            <svg class="lock-closed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
          </button>
        </div>
        <div class="swatch__hex">${slot.hex}</div>
      </div>
      <div class="swatch__copied" style="color:${text}">Copied!</div>
    `;

    // copy on swatch click
    sw.addEventListener("click", (e) => {
      if (e.target.closest(".lock-btn")) return;
      copyColor(slot.hex, sw);
    });
    sw.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); copyColor(slot.hex, sw); }
    });

    // lock toggle
    sw.querySelector(".lock-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      slots[i].locked = !slots[i].locked;
      sw.classList.toggle("locked");
      showToast(slots[i].locked ? "🔒 Color locked" : "🔓 Color unlocked");
    });

    paletteEl.appendChild(sw);
  });
}

/* ---------- Copy + toast ---------- */
async function copyColor(hex, swatchEl) {
  try {
    await navigator.clipboard.writeText(hex);
  } catch {
    // fallback for non-secure contexts
    const ta = document.createElement("textarea");
    ta.value = hex; document.body.appendChild(ta); ta.select();
    document.execCommand("copy"); ta.remove();
  }
  swatchEl.classList.remove("copied");
  void swatchEl.offsetWidth; // restart animation
  swatchEl.classList.add("copied");
  showToast(`${hex} copied to clipboard`);
}

let toastTimer;
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1600);
}

/* ---------- Controls ---------- */
generateBtn.addEventListener("click", () => generate(true));

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    chips.forEach((c) => c.classList.remove("is-active"));
    chip.classList.add("is-active");
    mode = chip.dataset.mode;
    generate(true);
  });
});

// Spacebar generates (unless typing in a field)
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && e.target === document.body) {
    e.preventDefault();
    generate(true);
  }
});

// first paint
generate(true);
