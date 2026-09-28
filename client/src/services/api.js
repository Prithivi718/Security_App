/**
 * API Service - Base HTTP Transport Client
 * Centralizes base URL configuration, headers, cookie credentials, and error handling.
 */

const getBaseURL = () => {
    if (typeof import.meta !== "undefined" && import.meta.env) {
        if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
        if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
    }
    if (typeof process !== "undefined" && process.env) {
        if (process.env.VITE_API_URL) return process.env.VITE_API_URL;
        if (process.env.VITE_API_BASE_URL) return process.env.VITE_API_BASE_URL;
    }
    if (typeof window !== "undefined" && window.location && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
        return "/api";
    }
    return "http://localhost:5000/api";
};

const API_BASE_URL = getBaseURL();

class ApiClient {
    constructor(baseURL = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    /**
     * Internal request wrapper around fetch
     */
    async request(endpoint, options = {}) {
        const url = endpoint.startsWith("http") ? endpoint : `${this.baseURL}${endpoint}`;

        const isFormData = options.body instanceof FormData;

        const defaultHeaders = {
            "Accept": "application/json",
            ...(isFormData ? {} : { "Content-Type": "application/json" })
        };

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            },
            credentials: options.credentials || "include" // Include JWT cookies
        };

        if (config.body && typeof config.body === "object" && !isFormData) {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);
            const contentType = response.headers.get("content-type");
            let data = null;

            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                const errorMessage = (data && data.message) || response.statusText || "HTTP Request Failed";
                const error = new Error(errorMessage);
                error.statusCode = response.status;
                error.data = data;
                throw error;
            }

            return data;
        } catch (error) {
            if (!error.statusCode) {
                error.statusCode = 500;
            }
            throw error;
        }
    }

    get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: "GET" });
    }

    post(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: "POST", body });
    }

    put(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: "PUT", body });
    }

    patch(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: "PATCH", body });
    }

    delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: "DELETE" });
    }
}

const api = new ApiClient();

// Standalone functional exports
export const apiRequest = (endpoint, options) => api.request(endpoint, options);
export const get = (endpoint, options) => api.get(endpoint, options);
export const post = (endpoint, body, options) => api.post(endpoint, body, options);
export const put = (endpoint, body, options) => api.put(endpoint, body, options);
export const patch = (endpoint, body, options) => api.patch(endpoint, body, options);
export const del = (endpoint, options) => api.delete(endpoint, options);

export default api;
