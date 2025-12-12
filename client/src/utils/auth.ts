import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: "https://biva-admin-server.onrender.com/api/auth",
  fetchOptions: {
    credentials: 'include'
  }
});