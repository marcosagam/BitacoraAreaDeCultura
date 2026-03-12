export type UserRole = "superadmin" | "admin" | "guest"

export interface User {
  id: string
  nombre: string
  cedula: string
  role: UserRole
  fechaCreacion: Date
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  role: UserRole
}
