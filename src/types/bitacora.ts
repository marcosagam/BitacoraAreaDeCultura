export interface BitacoraEntry {
  id: string
  fecha: Date
  fechaEntrega: Date
  titulo: string
  descripcion: string
  responsable: string
  categoria: string
  fechaCreacion: Date
  // cultura usa boolean; deporte usa string (estado dinámico)
  completada: boolean
  estado?: string
}
