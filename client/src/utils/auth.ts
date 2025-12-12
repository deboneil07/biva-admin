import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: "https://biva-admin.onrender.com/api/auth",
  fetchOptions: {
    credentials: 'include'
  }
});