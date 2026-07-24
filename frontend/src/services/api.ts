import axios from "axios";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.trim() ||
  "https://api.azalens.com";

export const api = axios.create({
  baseURL: apiBaseUrl.replace(/\/+$/, ""),
  timeout: 60000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});