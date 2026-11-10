// Shared button styles (A9): one family used across the app
const base =
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

export const btnPrimary = `${base} px-4 py-2 bg-violet-700 text-white hover:bg-violet-800`;
export const btnSecondary = `${base} px-3.5 py-2 bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 hover:border-gray-400`;
export const btnDanger = `${base} px-4 py-2 bg-red-700 text-white hover:bg-red-800`;
