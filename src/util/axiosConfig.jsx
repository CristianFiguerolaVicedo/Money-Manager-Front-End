import axios from "axios";
import { BASE_URL } from "./apiEndpoints";

const axiosConfig = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
    }
});

//List of endpoint that dont require authorization
const excludeEndpoint = ["/login", "/register", "/status", "/activate", "health"];

//Request Interceptor
axiosConfig.interceptors.request.use((config) => {
    const shouldSkipToken = excludeEndpoint.some((endpoint) => {
        config.url?.includes(endpoint)
    });

    if (!shouldSkipToken) {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

//Response interceptor
axiosConfig.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response) {
        if (error.response.status === 401) {
            window.location.href = "/login";
        } else if (error.response.status === 500) {
            console.error("Server error. Please try again later.");
        }
    } else if (error.code === "ECONNECTIONABORTED") {
        console.error("Request timeout. Please try again.");
    }
    return Promise.reject(error);
});