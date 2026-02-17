export interface AsistenciaEntry {
  id: string
  nombre: string
  fecha: Date
  hora: string
  tipo: "entrada" | "salida"
  espacio: "oficina" | "auditorio"
  fechaCreacion: Date
  latitud: number
  longitud: number
  distancia?: number // Distancia en metros desde el punto de referencia
}
