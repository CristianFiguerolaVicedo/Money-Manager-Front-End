import { useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { getThemePreference, setThemePreference } from "../util/theme";

const OPTIONS = [
  { value: "light", label: "Claro", Icon: Sun },
  { value: "dark", label: "Oscuro", Icon: Moon },
  { value: "system", label: "Sistema", Icon: Monitor },
];

// Light / dark / follow the system (saved in this browser)
const ThemeSwitcher = () => {
  const [preference, setPreference] = useState(getThemePreference);

  const choose = (value) => {
    setThemePreference(value);
    setPreference(value);
  };

  return (
    <div className="px-4 py-2">
      <p id="theme-label" className="text-xs text-gray-500 mb-1.5">Tema</p>
      <div role="radiogroup" aria-labelledby="theme-label" className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-gray-100">
        {OPTIONS.map((option) => {
          const { value, label } = option;
          const OptionIcon = option.Icon;
          const selected = preference === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              title={label}
              onClick={() => choose(value)}
              className={`flex flex-col items-center gap-0.5 py-1.5 rounded-md text-[11px] cursor-pointer transition-colors ${
                selected ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <OptionIcon size={15} />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSwitcher;
