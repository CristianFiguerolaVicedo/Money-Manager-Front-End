import axios from "axios";
import { BASE_URL } from "./apiEndpoints";
import { getToken } from "./auth";
import { endSession, refreshAccessToken } from "./session";
import { trackRequestEnd, trackRequestStart } from "./serverWakeNotice";

// The API is reached on the web's own domain (/api/v1.0, proxied by Netlify to Render),
// so the HttpOnly session cookie is first-party.
const axiosConfig = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
    }
});

// Endpoints that never need the access token
const PUBLIC_ENDPOINTS = ["/login", "/register", "/status", "/activate", "/health", "/forgot-password", "/reset-password", "/resend-activation", "/unsubscribe", "/refresh-token", "/logout"];
const isPublic = (url = "") => PUBLIC_ENDPOINTS.some((endpoint) => url === endpoint || url.startsWith(`${endpoint}?`));

// Requests that are safe to repeat if the backend was asleep (Netlify gives up after 26 s)
const isRetryable = (config) => ["get", "head"].includes((config.method || "get").toLowerCase()) || config.url === "/login";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

axiosConfig.interceptors.request.use((config) => {
    if (!isPublic(config.url)) {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return trackRequestStart(config);
}, (error) => Promise.reject(error));

axiosConfig.interceptors.response.use((response) => {
    trackRequestEnd(response.config);
    return response;
}, async (error) => {
    const config = error.config;
    trackRequestEnd(config);
    if (!config) return Promise.reject(error);
    const status = error.response?.status;

    // Expired access token: renew it with the cookie and repeat the request once
    if (status === 401 && !isPublic(config.url) && !config._renewed) {
        const token = await refreshAccessToken();
        if (token) {
            config._renewed = true;
            config.headers.Authorization = `Bearer ${token}`;
            return axiosConfig(config);
        }
        await endSession();
        const publicPages = ["/login", "/signup", "/forgot-password", "/reset-password", "/activate", "/unsubscribe"];
        if (!publicPages.includes(window.location.pathname)) {
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }

    // Backend still waking up: retry safe requests a few times
    if ((status === 502 || status === 503 || status === 504) && isRetryable(config) && (config._attempts || 0) < 3) {
        config._attempts = (config._attempts || 0) + 1;
        await sleep(3000);
        return axiosConfig(config);
    }
    return Promise.reject(error);
})

export default axiosConfig;
