import axios from "axios";
import { message } from "antd";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// Add bearer token to every request if exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const msg = error.response.data?.message || "Something went wrong!";
      if (status === 401) message.error("Unauthorized! Please login again.");
      else if (status === 403) message.error("Forbidden! Access denied.");
      else if (status >= 500) message.error("Server error! Try later.");
      else message.error(msg);
    } else if (error.request) {
      message.error("No response from server. Check your connection!");
    } else {
      message.error(error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
