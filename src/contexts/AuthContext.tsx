"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User, UserRole, Area, AuthState } from "../types/auth"

interface AuthContextType extends AuthState {
  login: (user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    role: "guest",
    area: "cultura",
  })

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setAuthState({
          user,
          isAuthenticated: true,
          role: user.role,
          area: user.area ?? "cultura",
        })
      } catch (error) {
        console.error("Error al cargar usuario:", error)
        localStorage.removeItem("user")
      }
    }
  }, [])

  const login = (user: User) => {
    setAuthState({
      user,
      isAuthenticated: true,
      role: user.role,
      area: user.area ?? "cultura",
    })
    localStorage.setItem("user", JSON.stringify(user))
  }

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      role: "guest",
      area: "cultura",
    })
    localStorage.removeItem("user")
  }

  return <AuthContext.Provider value={{ ...authState, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
