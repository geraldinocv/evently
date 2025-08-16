export type UserRole = "organizer" | "rp" | "admin"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: Date
  organizerId?: string // For RPs, links to their organizer
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Mock authentication functions - replace with real auth later
export const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@evently.com",
    name: "Admin User",
    role: "admin",
    createdAt: new Date(),
  },
  {
    id: "2",
    email: "organizer@evently.com",
    name: "Event Organizer",
    role: "organizer",
    createdAt: new Date(),
  },
  {
    id: "3",
    email: "rp@evently.com",
    name: "Sales Rep",
    role: "rp",
    organizerId: "2",
    createdAt: new Date(),
  },
]

export async function signIn(email: string, password: string): Promise<User | null> {
  // Mock authentication - replace with real auth
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const user = mockUsers.find((u) => u.email === email)
  if (user && password === "password") {
    return user
  }
  return null
}

export async function signUp(email: string, password: string, name: string, role: UserRole): Promise<User | null> {
  // Mock registration - replace with real auth
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const newUser: User = {
    id: Date.now().toString(),
    email,
    name,
    role,
    createdAt: new Date(),
  }

  mockUsers.push(newUser)
  return newUser
}

export async function signOut(): Promise<void> {
  // Mock sign out
  await new Promise((resolve) => setTimeout(resolve, 500))
}
