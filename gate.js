/* Password gate for Chroma.
   NOTE: this is a lightweight client-side gate — the password lives in the
   page source, so it deters casual visitors but is NOT real security. Don't
   use it to protect anything sensitive. */

(function () {
  const PASSWORD = "preview2026";
  const STORAGE_KEY = "chroma-unlocked";

  const gate = document.getElementById("gate");
  const form = document.getElementById("gateForm");
  const input = document.getElementById("gateInput");
  const box = gate.querySelector(".gate__box");
  const error = document.getElementById("gateError");

  function unlock(skipAnimation) {
    if (skipAnimation) gate.classList.add("hide");
    else requestAnimationFrame(() => gate.classList.add("hide"));
    document.body.classList.remove("is-locked");
    // remove from the DOM once it has faded out
    setTimeout(() => gate.remove(), skipAnimation ? 0 : 500);
  }

  // Already unlocked on a previous visit in this browser?
  let remembered = false;
  try {
    remembered = localStorage.getItem(STORAGE_KEY) === "yes";
  } catch (e) {
    /* localStorage may be unavailable (private mode) — fall back to prompting */
  }

  if (remembered) {
    unlock(true);
    return;
  }

  document.body.classList.add("is-locked");
  input.focus();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (input.value === PASSWORD) {
      try { localStorage.setItem(STORAGE_KEY, "yes"); } catch (e) { /* ignore */ }
      error.classList.remove("show");
      unlock(false);
    } else {
      error.textContent = "That's not quite right — try again.";
      error.classList.add("show");
      box.classList.remove("shake");
      void box.offsetWidth; // restart the shake animation
      box.classList.add("shake");
      input.select();
    }
  });

  // clear the error as soon as the user starts retyping
  input.addEventListener("input", () => error.classList.remove("show"));
})();
