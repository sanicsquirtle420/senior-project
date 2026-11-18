const API_URL = "https://api.raccoon2891.com";

export function authFetch(path: string, token: string | null, options: RequestInit = {}) {
    return fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });
}