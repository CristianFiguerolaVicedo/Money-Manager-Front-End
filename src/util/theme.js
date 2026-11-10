// Light / dark theme. The choice ("light" | "dark" | "system") is a per-browser convenience in localStorage;
// index.html applies it before the first paint so there is no white flash.

const STORAGE_KEY = "theme";
const listeners = new Set();
let media = null;

export const getThemePreference = () => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
};

const systemPrefersDark = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;

export const isDarkTheme = () =>
  typeof document !== "undefined" && document.documentElement.classList.contains("dark");

const apply = () => {
  const preference = getThemePreference();
  const dark = preference === "dark" || (preference === "system" && systemPrefersDark());
  document.documentElement.classList.toggle("dark", dark);
  listeners.forEach((listener) => listener(dark));
};

export const setThemePreference = (preference) => {
  try {
    if (preference === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // storage unavailable: the theme still changes for this visit
    document.documentElement.dataset.themeOverride = preference;
  }
  apply();
};

// Follow the operating system while the preference is "system"
export const initTheme = () => {
  if (media || typeof window === "undefined" || !window.matchMedia) return;
  media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener?.("change", () => {
    if (getThemePreference() === "system") apply();
  });
  apply();
};

export const onThemeChange = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
