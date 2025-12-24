import axios from "axios";

export const instance = axios.create({
  baseURL: "https://biva-admin-server.onrender.com",
  // https://biva-admin-server.onrender.com
  withCredentials: true
});