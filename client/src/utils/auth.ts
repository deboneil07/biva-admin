import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000/api/auth",
  // https://biva-admin-server.onrender.com/api/auth
  fetchOptions: {
    credentials: 'include'
  }
});