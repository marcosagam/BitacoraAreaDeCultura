"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "../../../contexts/AuthContext"
import type { User, UserRole } from "../../../types/auth"
import { isMultiAreaInput, resolveArea } from "../../../lib/area"

function parseAreaFromPath(path: string): string | null {
  const queryIndex = path.indexOf("?")
  if (queryIndex === -1) return null
  return new URLSearchParams(path.slice(queryIndex + 1)).get("area")
}

function SSOHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [error, setError] = useState("")

  useEffect(() => {
    const token = searchParams.get("token")
    if (!token) {
      setError("Token no proporcionado.")
      return
    }

    fetch("/api/auth/verify-sso", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
          return
        }

        const rawArea = data.area as string | undefined
        const multiArea = isMultiAreaInput(rawArea) || data.role === "superadmin"
        const redirectRaw = searchParams.get("redirect") ?? "/"
        const redirect = decodeURIComponent(redirectRaw)
        const redirectArea = parseAreaFromPath(redirect)
        const urlArea = redirectArea ?? searchParams.get("area")
        const resolvedArea = multiArea
          ? resolveArea(urlArea, "cultura")
          : resolveArea(rawArea, "cultura", urlArea)

        const user: User = {
          id: data.uid,
          nombre: data.nombre,
          cedula: data.cedula,
          role: data.role as UserRole,
          area: resolvedArea,
          fechaCreacion: new Date(),
        }

        login(user, { multiArea, urlArea })
        router.replace(redirect.split("?")[0] || "/")
      })
      .catch(() => setError("Error al verificar el acceso."))
  }, [searchParams, login, router])

  if (error) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: "12px" }}>
        <p style={{ color: "#dc2626", fontSize: "16px" }}>{error}</p>
        <a href="/" style={{ color: "#2563eb", textDecoration: "underline" }}>Volver al inicio</a>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <p style={{ color: "#6b7280" }}>Iniciando sesión...</p>
    </div>
  )
}

export default function SSOPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <p style={{ color: "#6b7280" }}>Cargando...</p>
      </div>
    }>
      <SSOHandler />
    </Suspense>
  )
}
