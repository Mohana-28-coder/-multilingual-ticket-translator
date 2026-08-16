import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://multilingual-ticket-translator-kq9m.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) =>
    api.post("/auth/login", data),
  register: (data) =>
    api.post("/auth/register", data),
  getMe: () =>
    api.get("/auth/me"),
  updateProfile: (data) =>
    api.put("/auth/me", data),
};

export const ticketAPI = {
  create: (formData) =>
    api.post("/tickets/", formData, {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }),
  getAll: () =>
    api.get("/tickets/"),
  getById: (id) =>
    api.get(`/tickets/${id}`),
  updateStatus: (id, data) =>
    api.put(
      `/tickets/${id}/status`,
      data
    ),
};

export const adminAPI = {
  getKPI: () =>
    api.get("/admin/kpi"),
  getAllTickets: (params) =>
    api.get("/admin/tickets", {
      params,
    }),
  getAISuggestion: (ticketId) =>
    api.get(
      `/admin/tickets/${ticketId}/suggestion`
    ),
  respondToTicket: (
    ticketId,
    data
  ) =>
    api.post(
      `/admin/tickets/${ticketId}/respond`,
      data
    ),
};

export const translationAPI = {
  detect: (text) =>
    api.post(
      "/translation/detect",
      { text }
    ),
  translate: (data) =>
    api.post(
      "/translation/translate",
      data
    ),
  getLanguages: () =>
    api.get(
      "/translation/languages"
    ),
};

export default api;