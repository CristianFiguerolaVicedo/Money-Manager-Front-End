import axios from "axios";

const axiosConfig = axios.create({
    baseURL: "https://money-manager-t0yw.onrender.com/api/v1.0",
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