import axios from "axios";

// Use relative URL in production (when served from backend) or absolute URL in development
const baseURL = import.meta.env.PROD ? "/api" : "http://localhost:5000/api";

const API = axios.create({ baseURL });

// Attach JWT token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
