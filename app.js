const PIXEL_PARTY_KEYS = {
  points: "pixelPartyPoints",
  retroUnlocked: "pixelPartyRetroUnlocked",
  minesweeperUnlocked: "pixelPartyMinesweeperUnlocked",
  blockBreakerUnlocked: "pixelPartyBlockBreakerUnlocked",
  theme: "pixelPartyTheme"
};

function getStoredNumber(key) {
  const raw = localStorage.getItem(key);
  const value = Number(raw);
  return Number.isFinite(value) ? value : 0;
}

function getPoints() {
  return Math.max(0, getStoredNumber(PIXEL_PARTY_KEYS.points));
}

function setPoints(value) {
  localStorage.setItem(PIXEL_PARTY_KEYS.points, String(Math.max(0, Math.floor(value))));
  refreshPointsDisplays();
}

function addPoints(amount) {
  const gain = Math.max(0, Math.floor(amount));
  if (!gain) return getPoints();
  const updated = getPoints() + gain;
  setPoints(updated);
  return updated;
}

function spendPoints(amount) {
  const cost = Math.max(0, Math.floor(amount));
  if (getPoints() < cost) return false;
  setPoints(getPoints() - cost);
  return true;
}

function isRetroUnlocked() {
  return localStorage.getItem(PIXEL_PARTY_KEYS.retroUnlocked) === "true";
}

function unlockRetroTheme() {
  localStorage.setItem(PIXEL_PARTY_KEYS.retroUnlocked, "true");
}

function isGameUnlocked(gameKey) {
  if (gameKey === "minesweeper") {
    return localStorage.getItem(PIXEL_PARTY_KEYS.minesweeperUnlocked) === "true";
  }
  if (gameKey === "block-breaker") {
    return localStorage.getItem(PIXEL_PARTY_KEYS.blockBreakerUnlocked) === "true";
  }
  return true;
}

function unlockGame(gameKey) {
  if (gameKey === "minesweeper") {
    localStorage.setItem(PIXEL_PARTY_KEYS.minesweeperUnlocked, "true");
  }
  if (gameKey === "block-breaker") {
    localStorage.setItem(PIXEL_PARTY_KEYS.blockBreakerUnlocked, "true");
  }
}

function getTheme() {
  const saved = localStorage.getItem(PIXEL_PARTY_KEYS.theme);
  return saved === "retro" ? "retro" : "neon";
}

function setTheme(themeName) {
  if (themeName === "retro" && !isRetroUnlocked()) return false;
  const next = themeName === "retro" ? "retro" : "neon";
  localStorage.setItem(PIXEL_PARTY_KEYS.theme, next);
  applyTheme();
  return true;
}

function applyTheme() {
  const useRetro = getTheme() === "retro" && isRetroUnlocked();
  document.body.classList.toggle("retro-theme", useRetro);
  updateThemeButtons();
  window.dispatchEvent(new CustomEvent("pixelparty:themechange", { detail: { theme: useRetro ? "retro" : "neon" } }));
}

function refreshPointsDisplays() {
  const points = getPoints();
  document.querySelectorAll("[data-points-display]").forEach((el) => {
    el.textContent = String(points);
  });
}

function updateThemeButtons() {
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    if (!isRetroUnlocked()) {
      button.style.display = "none";
      return;
    }
    button.style.display = "inline-flex";
    const retroOn = getTheme() === "retro";
    button.textContent = retroOn ? "Use Neon Theme" : "Use Retro Theme";
    button.setAttribute("aria-pressed", String(retroOn));
  });
}

function toggleTheme() {
  if (!isRetroUnlocked()) return;
  setTheme(getTheme() === "retro" ? "neon" : "retro");
}

function refreshLockedGameCards() {
  document.querySelectorAll("[data-lock-game]").forEach((card) => {
    const key = card.getAttribute("data-lock-game");
    const unlocked = isGameUnlocked(key);
    const lockBadge = card.querySelector("[data-lock-badge]");
    card.classList.toggle("locked-card", !unlocked);
    if (lockBadge) {
      lockBadge.textContent = unlocked ? "Owned" : "Locked - Buy In Shop";
    }
    if (card.tagName === "A") {
      card.setAttribute("aria-disabled", String(!unlocked));
      card.tabIndex = unlocked ? 0 : -1;
    }
  });
}

function bindLockedGameCards() {
  document.querySelectorAll("a[data-lock-game]").forEach((card) => {
    card.addEventListener("click", (event) => {
      const key = card.getAttribute("data-lock-game");
      if (isGameUnlocked(key)) return;
      event.preventDefault();
      alert("This game is locked. Buy it from the shop first.");
      window.location.href = "shop.html";
    });
  });
}

function guardLockedGamePage() {
  const requiredGame = document.body.getAttribute("data-requires-game");
  if (!requiredGame) return false;
  if (isGameUnlocked(requiredGame)) return false;
  alert("This game is locked. Buy it from the shop first.");
  window.location.href = "shop.html";
  return true;
}

window.pixelParty = {
  getPoints,
  addPoints,
  spendPoints,
  isRetroUnlocked,
  unlockRetroTheme,
  isGameUnlocked,
  unlockGame,
  getTheme,
  setTheme,
  toggleTheme
};

document.addEventListener("DOMContentLoaded", () => {
  if (guardLockedGamePage()) return;
  applyTheme();
  refreshPointsDisplays();
  updateThemeButtons();
  refreshLockedGameCards();
  bindLockedGameCards();
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", toggleTheme);
  });
});
