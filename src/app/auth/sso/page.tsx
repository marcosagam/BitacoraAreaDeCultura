"use client"

import { Suspense } from "react"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "../../../contexts/AuthContext"
import type { User } from "../../../types/auth"

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

        const user: User = {
          id: data.uid,
          nombre: data.nombre,
          cedula: data.cedula,
          role: data.role,
          fechaCreacion: new Date(),
        }

        login(user)
        const redirect = searchParams.get("redirect") ?? "/"
        router.replace(redirect)
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
