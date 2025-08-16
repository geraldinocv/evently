"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

interface User {
  id: string
  email: string
  name: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<boolean>
  signUp: (email: string, password: string, name: string) => Promise<boolean>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", session.user.id).single()

        if (profile) {
          setAuthState({
            user: {
              id: session.user.id,
              email: session.user.email!,
              name: profile.name || session.user.email!,
            },
            isLoading: false,
            isAuthenticated: true,
          })
        } else {
          setAuthState({
            user: {
              id: session.user.id,
              email: session.user.email!,
              name: session.user.email!,
            },
            isLoading: false,
            isAuthenticated: true,
          })
        }
      } else {
        setAuthState((prev) => ({ ...prev, isLoading: false }))
      }
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", session.user.id).single()

        if (profile) {
          setAuthState({
            user: {
              id: session.user.id,
              email: session.user.email!,
              name: profile.name || session.user.email!,
            },
            isLoading: false,
            isAuthenticated: true,
          })
        } else {
          setAuthState({
            user: {
              id: session.user.id,
              email: session.user.email!,
              name: session.user.email!,
            },
            isLoading: false,
            isAuthenticated: true,
          })
        }
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Login error:", error.message)
        return false
      }

      return !!data.user
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const handleSignUp = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
        },
      })

      if (error) {
        console.error("Signup error:", error.message)
        return false
      }

      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          user_id: data.user.id,
          name: name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (profileError) {
          console.error("Profile creation error:", profileError.message)
        }
      }

      return true
    } catch (error) {
      console.error("Signup error:", error)
      return false
    }
  }

  const handleSignOut = async (): Promise<void> => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
