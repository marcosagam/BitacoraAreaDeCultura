export interface AsistenciaEntry {
  id: string
  nombre: string
  fecha: Date
  hora: string
  tipo: "entrada" | "salida"
  fechaCreacion: Date
  latitud: number
  longitud: number
  distancia?: number // Distancia en metros desde el punto de referencia
}
