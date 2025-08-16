"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { type AuthState, signIn, signUp, signOut, type UserRole } from "@/lib/auth"

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<boolean>
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<boolean>
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
    // Check for stored user session
    const storedUser = localStorage.getItem("evently_user")
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        })
      } catch {
        localStorage.removeItem("evently_user")
        setAuthState((prev) => ({ ...prev, isLoading: false }))
      }
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [])

  const handleSignIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const user = await signIn(email, password)
      if (user) {
        localStorage.setItem("evently_user", JSON.stringify(user))
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        })
        return true
      }
      return false
    } catch {
      return false
    }
  }

  const handleSignUp = async (email: string, password: string, name: string, role: UserRole): Promise<boolean> => {
    try {
      const user = await signUp(email, password, name, role)
      if (user) {
        localStorage.setItem("evently_user", JSON.stringify(user))
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        })
        return true
      }
      return false
    } catch {
      return false
    }
  }

  const handleSignOut = async (): Promise<void> => {
    await signOut()
    localStorage.removeItem("evently_user")
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    })
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
