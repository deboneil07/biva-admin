import axios from "axios";

export const instance = axios.create({
  baseURL: "http://localhost:3000",
  // https://biva-admin-server.onrender.com
  withCredentials: true
});