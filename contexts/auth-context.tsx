"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { getCurrentUser, logoutUser, type User } from "@/lib/auth/supabase-auth"

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>
  refreshUser: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    const checkAuth = () => {
      console.log("[v0] Checking authentication state")
      const user = getCurrentUser()

      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: !!user,
      })

      console.log("[v0] Auth state updated:", { authenticated: !!user, user: user?.email })
    }

    checkAuth()

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "evently_user") {
        checkAuth()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const handleSignOut = async (): Promise<void> => {
    console.log("[v0] Signing out user")
    logoutUser()
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    })
  }

  const refreshUser = () => {
    const user = getCurrentUser()
    setAuthState({
      user,
      isLoading: false,
      isAuthenticated: !!user,
    })
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        signOut: handleSignOut,
        refreshUser,
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
