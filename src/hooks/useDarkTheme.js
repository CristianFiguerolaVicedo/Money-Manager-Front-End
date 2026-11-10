import { useEffect, useState } from "react";
import { isDarkTheme, onThemeChange } from "../util/theme";

// true while the dark theme is on (re-renders when it changes)
const useDarkTheme = () => {
  const [dark, setDark] = useState(isDarkTheme);
  useEffect(() => onThemeChange(setDark), []);
  return dark;
};

export default useDarkTheme;
