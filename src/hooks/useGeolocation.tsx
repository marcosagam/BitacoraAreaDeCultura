"use client"
import { useState, useEffect } from "react"

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  error: string | null
  loading: boolean
  isInRange: boolean
  distance: number | null
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
  targetLocations: Array<{
    latitude: number
    longitude: number
    name?: string
  }>
  allowedRange: number // en metros
}

// Función para calcular la distancia entre dos puntos usando la fórmula de Haversine
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3 // Radio de la Tierra en metros
  const φ1 = (lat1 * Math.PI) / 180 // φ, λ en radianes
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  const distance = R * c // en metros
  return distance
}

export function useGeolocation(options: UseGeolocationOptions): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: true,
    isInRange: false,
    distance: null,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "La geolocalización no está soportada por este navegador",
        loading: false,
      }))
      return
    }

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = position.coords
      
      // Calcular distancia a cada ubicación permitida y encontrar la más cercana
      let minDistance = Infinity
      let isInRange = false
      
      for (const target of options.targetLocations) {
        const distance = calculateDistance(latitude, longitude, target.latitude, target.longitude)
        if (distance < minDistance) {
          minDistance = distance
        }
        if (distance <= options.allowedRange) {
          isInRange = true
        }
      }

      setState({
        latitude,
        longitude,
        accuracy,
        error: null,
        loading: false,
        isInRange,
        distance: minDistance,
      })
    }

    const handleError = (error: GeolocationPositionError) => {
      let errorMessage = "Error desconocido al obtener la ubicación"

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Permisos de ubicación denegados. Por favor, habilite los permisos de ubicación."
          break
        case error.POSITION_UNAVAILABLE:
          errorMessage = "La información de ubicación no está disponible."
          break
        case error.TIMEOUT:
          errorMessage = "Tiempo de espera agotado al obtener la ubicación."
          break
      }

      setState((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }))
    }

    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: options.enableHighAccuracy ?? true,
      timeout: options.timeout ?? 10000,
      maximumAge: options.maximumAge ?? 60000,
    })

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [options.targetLocations, options.allowedRange])

  return state
}
