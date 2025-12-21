import axios from "axios";

export const instance = axios.create({
  baseURL: "https://biva-admin.onrender.com",
  withCredentials: true
});