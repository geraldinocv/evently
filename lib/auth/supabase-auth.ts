import { createClient } from "@/lib/supabase/client"

export interface User {
  id: number
  email: string
  name: string
}

export interface AuthResult {
  success: boolean
  user?: User
  message?: string
}

export async function authenticateUser(email: string, password: string): Promise<AuthResult> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.rpc("authenticate_user", {
      user_email: email,
      user_password: password,
    })

    if (error) {
      console.error("[v0] Authentication error:", error)
      return { success: false, message: "Authentication failed" }
    }

    const result = data?.[0]

    if (result?.success) {
      const user: User = {
        id: result.id,
        email: result.email,
        name: result.name,
      }

      // Store in localStorage for client-side access
      localStorage.setItem("evently_user", JSON.stringify(user))

      return { success: true, user }
    } else {
      return { success: false, message: "Invalid credentials" }
    }
  } catch (error) {
    console.error("[v0] Authentication error:", error)
    return { success: false, message: "Authentication failed" }
  }
}

export async function registerUser(email: string, password: string, name: string): Promise<AuthResult> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.rpc("register_user", {
      user_email: email,
      user_password: password,
      user_name: name,
    })

    if (error) {
      console.error("[v0] Registration error:", error)
      return { success: false, message: "Registration failed" }
    }

    const result = data?.[0]

    if (result?.success) {
      const user: User = {
        id: result.id,
        email: result.email,
        name: result.name,
      }

      // Store in localStorage for client-side access
      localStorage.setItem("evently_user", JSON.stringify(user))

      return { success: true, user, message: result.message }
    } else {
      return { success: false, message: result?.message || "Registration failed" }
    }
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return { success: false, message: "Registration failed" }
  }
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null

  try {
    const userStr = localStorage.getItem("evently_user")
    return userStr ? JSON.parse(userStr) : null
  } catch {
    return null
  }
}

export function logoutUser(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("evently_user")
  }
}
