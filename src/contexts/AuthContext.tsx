"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { User, UserRole, Area, AuthState } from "../types/auth"
import {
  ACTIVE_AREA_KEY,
  isValidArea,
  resolveArea,
} from "../lib/area"

interface LoginOptions {
  multiArea?: boolean
  urlArea?: string | null
}

interface AuthContextType extends AuthState {
  login: (user: User, options?: LoginOptions) => void
  logout: () => void
  setActiveArea: (area: Area) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function readStoredActiveArea(): Area | null {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem(ACTIVE_AREA_KEY)
  return isValidArea(stored) ? stored : null
}

function resolveLoginArea(
  user: User,
  options?: LoginOptions,
): { area: Area; multiArea: boolean } {
  const urlArea = options?.urlArea
  const storedArea = readStoredActiveArea()
  const multiArea =
    options?.multiArea === true ||
    user.role === "superadmin"

  if (!multiArea && isValidArea(user.area)) {
    return { area: user.area, multiArea: false }
  }

  const area = resolveArea(urlArea, "cultura", storedArea ?? user.area)
  return { area, multiArea }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    role: "guest",
    area: "cultura",
    multiArea: false,
  })

  const applyArea = useCallback((area: Area, multiArea: boolean) => {
    localStorage.setItem(ACTIVE_AREA_KEY, area)
    setAuthState((prev) => ({ ...prev, area, multiArea }))
  }, [])

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    const storedMultiArea = localStorage.getItem("bitacoraMultiArea") === "true"
    const storedActiveArea = readStoredActiveArea()

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as User
        const { area, multiArea } = resolveLoginArea(user, {
          multiArea: storedMultiArea,
          urlArea: storedActiveArea,
        })
        setAuthState({
          user,
          isAuthenticated: true,
          role: user.role,
          area,
          multiArea,
        })
        return
      } catch (error) {
        console.error("Error al cargar usuario:", error)
        localStorage.removeItem("user")
      }
    }

    // Invitado: respetar área en URL o localStorage
    const params = new URLSearchParams(window.location.search)
    const urlArea = params.get("area")
    const guestArea = resolveArea(urlArea, "cultura", storedActiveArea)
    if (isValidArea(urlArea) || storedActiveArea) {
      localStorage.setItem(ACTIVE_AREA_KEY, guestArea)
      setAuthState((prev) => ({ ...prev, area: guestArea }))
    }
  }, [])

  const login = (user: User, options?: LoginOptions) => {
    const { area, multiArea } = resolveLoginArea(user, options)
    const sessionUser: User = { ...user, area }

    localStorage.setItem("user", JSON.stringify(sessionUser))
    localStorage.setItem("bitacoraMultiArea", String(multiArea))
    localStorage.setItem(ACTIVE_AREA_KEY, area)

    setAuthState({
      user: sessionUser,
      isAuthenticated: true,
      role: user.role,
      area,
      multiArea,
    })
  }

  const logout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("bitacoraMultiArea")
    setAuthState({
      user: null,
      isAuthenticated: false,
      role: "guest",
      area: readStoredActiveArea() ?? "cultura",
      multiArea: false,
    })
  }

  const setActiveArea = (area: Area) => {
    localStorage.setItem(ACTIVE_AREA_KEY, area)
    setAuthState((prev) => {
      const nextUser = prev.user ? { ...prev.user, area } : null
      if (nextUser) {
        localStorage.setItem("user", JSON.stringify(nextUser))
      }
      return { ...prev, area, user: nextUser }
    })
  }

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, setActiveArea }}>
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
