# AGENTS.md - Agentic Coding Guidelines for BIVA Admin

## Project Overview

This is a monorepo with two applications:
- **client/**: React + TypeScript + Vite frontend (port 5173)
- **server/**: Bun + Hono backend with better-auth and Drizzle ORM

---

## Build, Lint, and Test Commands

### Client Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint on entire codebase |
| `npm run lint -- --fix` | Run ESLint with auto-fix |
| `npm run preview` | Preview production build |

To run a single lint check on a specific file:
```bash
npm run lint -- path/to/file.ts
```

### Server Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start dev server with hot reload |
| `bun run index.ts` | Run server directly |
| `bun install` | Install dependencies |

### Database (Server)

```bash
# Run Drizzle migrations
bunx drizzle-kit push

# Generate Drizzle types
bunx drizzle-kit generate
```

---

## Code Style Guidelines

### General Principles

- Use **TypeScript** for all code - avoid `any` when possible
- Use **Zod** for runtime validation of external data (API responses, form inputs)
- Use **console.error** for error logging (no structured logger currently)
- Keep components focused and small (single responsibility)

### File Organization

```
client/src/
├── components/
│   ├── ui/          # Reusable Radix UI components (Button, Dialog, etc.)
│   └── *.tsx        # Feature-specific components
├── hooks/           # Custom React hooks (useAuth, useUser, etc.)
├── store/           # Zustand stores (*-store.ts, use*Store.ts)
├── pages/           # Route page components
├── lib/             # Utilities (cn, config)
├── utils/           # Helper functions (axios, auth)
├── data/            # Static data/config
└── App.tsx          # Main app with routing
```

### Imports

- Use **path alias** `@/` for imports from `src/`:
  ```typescript
  import { Button } from "@/components/ui/button"
  import { cn } from "@/lib/utils"
  import { useAuth } from "@/hooks/useAuth"
  ```
- **Order imports**: external → internal → relative
- Group imports by type (React, Radix, utils, hooks)

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `Gallery.tsx`, `HotelBookings.tsx` |
| Hooks | camelCase + `use` prefix | `useAuth.ts`, `useUserRole.ts` |
| Zustand Store | `use` + PascalName + `Store` | `useUserStore`, `useEventStore` |
| Store Files | kebab-case | `user-store.ts`, `event-store.ts` |
| Utils | PascalCase | `auth.ts`, `axios.ts` |
| UI Components | PascalCase | `Button`, `Dialog`, `Select` |

### Components

- Use **Radix UI** primitives for accessible components
- Use **class-variance-authority (CVA)** for component variants
- Use **Tailwind CSS** for styling
- Use **tailwind-merge** (`cn()`) for combining classes
- Use **data-slot** pattern for polymorphic components

Example component structure:
```typescript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva("...", {
  variants: {
    variant: { default: "...", destructive: "..." },
    size: { default: "...", sm: "...", lg: "..." },
  },
  defaultVariants: { variant: "default", size: "default" },
})

export function Button({ className, variant, size, asChild, ...props }) {
  const Comp = asChild ? Slot : "button"
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
}
```

### Hooks

- Export as **default export** for hooks
- Return object with named properties
- Use functional updates for state setters when applicable
- Handle loading, error, and data states explicitly

Example:
```typescript
export default function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function signIn(email: string, password: string) {
    setLoading(true)
    setError(null)
    try {
      // ... logic
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return { signIn, loading, error }
}
```

### Zustand Stores

- Create interface for store shape
- Use `create<StoreInterface>()` with explicit typing
- Keep stores minimal - co-locate related state

```typescript
interface UserStore {
  id: string[]
  count: number
  updateStore: (data: Partial<UserStore>) => void
}

export const useUserStore = create<UserStore>((set) => ({
  id: [],
  count: 0,
  updateStore: (data) => set((state) => ({ ...state, ...data })),
}))
```

### Types

- Define interfaces for API responses and data structures
- Use `type` for unions, utility types
- Avoid `any` - use `unknown` with type guards if needed
- Export types that are reused across components

### Error Handling

- Use try/catch blocks for async operations
- Set error state and return early on failure
- Log errors with `console.error` for debugging
- Consider using `sonner` (toast notifications) for user feedback

### Tailwind CSS

- Use Tailwind v4 with `@tailwindcss/vite` plugin
- Use CSS variables for theming in `index.css`
- Follow standard Tailwind class ordering (layout → spacing → visual → state)
- Use `cn()` utility to merge conditional classes

### API Calls

- Use **axios** for HTTP requests
- Create axios instance with base URL and interceptors
- Handle errors at call site with try/catch
- Consider custom hooks for data fetching (like existing `use*` hooks)

---

## Technology Stack

| Layer | Technology |
|-------|-------------|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS v4, class-variance-authority |
| UI Components | Radix UI primitives |
| State | Zustand |
| Data Fetching | TanStack Query (React Query) |
| Forms | React Router DOM, Zod |
| Auth | better-auth |
| Charts | Recharts |
| Backend | Bun, Hono |
| Database | PostgreSQL (Neon), Drizzle ORM |
| Auth (Backend) | better-auth |

---

## Development Workflow

1. **Start development**: Run `npm run dev` in `client/` and `bun run dev` in `server/`
2. **Create components**: Add to appropriate folder under `src/components/`
3. **Add pages**: Create in `src/pages/` and add route in `App.tsx`
4. **Add hooks**: Create custom hooks in `src/hooks/`
5. **Add store**: Create Zustand store in `src/store/`
6. **Lint before commit**: Run `npm run lint` and fix any issues

---

## Notes

- No formal test framework currently configured
- Server runs on Bun runtime (not Node.js)
- Uses path alias `@/` configured in `tsconfig.json`
- ESLint uses typescript-eslint with recommended rules
