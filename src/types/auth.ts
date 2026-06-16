export type UserRole = "superadmin" | "admin" | "guest"
export type Area = "cultura" | "deporte"

export interface User {
  id: string
  nombre: string
  cedula: string
  role: UserRole
  area?: Area
  fechaCreacion: Date
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  role: UserRole
  area: Area
  multiArea: boolean
}
