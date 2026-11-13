// Applies the saved theme before the first paint (same logic as src/util/theme.js).
// A separate file instead of an inline script so the Content-Security-Policy needs no unsafe-inline for scripts.
(function () {
  var pref = "dark";
  try {
    pref = localStorage.getItem("theme") || "dark";
  } catch {
    // Storage blocked (private mode): keep the dark default
  }
  var dark = pref === "dark" || (pref === "system" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  if (dark) document.documentElement.classList.add("dark");
})();
