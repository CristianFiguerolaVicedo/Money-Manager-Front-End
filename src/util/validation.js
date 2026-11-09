export const validateEmail = (email) => {
    if (email.trim()) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    return false;
}
// Same rules as the backend (InputRules): 8+ characters, max 72 bytes, a letter and a number.
// Returns an error message, or null when the password is valid.
export const validatePassword = (password) => {
    if (!password || !password.trim()) return "Introduce una contraseña";
    if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres";
    if (new TextEncoder().encode(password).length > 72) return "La contraseña es demasiado larga (máximo 72 caracteres)";
    if (!/\p{L}/u.test(password) || !/\d/.test(password)) return "La contraseña debe incluir al menos una letra y un número";
    return null;
};

export const PASSWORD_HINT = "Mínimo 8 caracteres, con al menos una letra y un número";
