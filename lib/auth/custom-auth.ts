import { createClient } from "@/lib/supabase/client"

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  phone?: string
  company_name?: string
}

export interface User {
  id: string
  name: string
  email: string
}

export async function loginUser(credentials: LoginCredentials): Promise<{ user: User | null; error: string | null }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.rpc("verify_password", {
      email: credentials.email,
      password: credentials.password,
    })

    if (error) {
      console.error("[v0] Login error:", error)
      return { user: null, error: "Credenciais inválidas" }
    }

    if (!data || data.length === 0) {
      return { user: null, error: "Email ou senha incorretos" }
    }

    const user = data[0]
    console.log("[v0] User logged in successfully:", user.email)

    if (typeof window !== "undefined") {
      localStorage.setItem("evently_user", JSON.stringify(user))
    }

    return { user, error: null }
  } catch (error) {
    console.error("[v0] Login exception:", error)
    return { user: null, error: "Erro interno do servidor" }
  }
}

export async function registerUser(userData: RegisterData): Promise<{ user: User | null; error: string | null }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.rpc("hash_password", { password: userData.password })

    if (error) {
      console.error("[v0] Password hashing error:", error)
      return { user: null, error: "Erro ao processar senha" }
    }

    const hashedPassword = data

    const { data: profile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        phone: userData.phone,
        company_name: userData.company_name,
      })
      .select("id, name, email")
      .single()

    if (insertError) {
      console.error("[v0] Registration error:", insertError)
      if (insertError.code === "23505") {
        return { user: null, error: "Email já está em uso" }
      }
      return { user: null, error: "Erro ao criar conta" }
    }

    console.log("[v0] User registered successfully:", profile.email)

    if (typeof window !== "undefined") {
      localStorage.setItem("evently_user", JSON.stringify(profile))
    }

    return { user: profile, error: null }
  } catch (error) {
    console.error("[v0] Registration exception:", error)
    return { user: null, error: "Erro interno do servidor" }
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
