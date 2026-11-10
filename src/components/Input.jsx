import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";

const fieldClass =
  "w-full bg-transparent border border-gray-300 rounded-lg py-2 px-3 text-gray-800 leading-tight " +
  "focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-200 " +
  "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed";

// Text/number/date/password input or select, with a label that is really tied to the field (A11)
const Input = ({
  label,
  value,
  onChange,
  placeholder,
  type,
  isSelect,
  options,
  disabled = false,
  id,
  autoComplete,
}) => {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="mb-4">
      <label htmlFor={fieldId} className="block text-[13px] font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        {isSelect ? (
          <select id={fieldId} value={value} onChange={(e) => onChange(e)} disabled={disabled} className={fieldClass}>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={fieldId}
            className={`${fieldClass} ${isPassword ? "pr-11" : ""}`}
            type={isPassword ? (showPassword ? "text" : "password") : type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e)}
            disabled={disabled}
            autoComplete={autoComplete}
          />
        )}

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((shown) => !shown)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={showPassword}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-gray-500 hover:text-violet-700 cursor-pointer"
          >
            {showPassword ? <Eye size={18} aria-hidden="true" /> : <EyeOff size={18} aria-hidden="true" />}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;
