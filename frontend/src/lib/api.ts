import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api/v1",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Simple CSRF interceptor if needed later handling X-CSRF-Token
// For now, we rely on browser handling cookies and maybe reading the cookie to set header manually if strict mode
// But Gin generic CSRF often looks for header.
// Let's simplified: If we have the cookie, we try to read it.

export default api;
