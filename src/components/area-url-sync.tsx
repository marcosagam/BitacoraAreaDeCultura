"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "../contexts/AuthContext"
import { isValidArea } from "../lib/area"

/** Sincroniza ?area= de la URL con la sesión (invitados y cambios de enlace). */
export default function AreaUrlSync() {
  const searchParams = useSearchParams()
  const { setActiveArea, isAuthenticated } = useAuth()

  useEffect(() => {
    const urlArea = searchParams.get("area")
    if (isValidArea(urlArea)) {
      setActiveArea(urlArea)
    }
  }, [searchParams, setActiveArea, isAuthenticated])

  return null
}
