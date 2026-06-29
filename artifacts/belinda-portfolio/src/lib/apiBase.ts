// Base URL for the backend API.
//
// In local dev and single-origin deploys this is empty, so requests stay
// relative (e.g. "/api/socratic/reply"). On Railway the API runs as a
// separate service, so set the build-time env var VITE_API_URL to that
// service's public URL (e.g. https://my-api.up.railway.app) and all API
// calls will be sent there instead.
export const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
