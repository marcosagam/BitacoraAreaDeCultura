import { collection, addDoc, getDocs, query, where, Timestamp, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { toast } from "sonner"
import { db } from "./config"
import type { User } from "../types/auth"
import { SUPER_ADMIN_CREDENTIALS } from "../constants/superadmin"

const COLLECTION_NAME = "admins"

// Convertir datos de Firestore a User
const convertFromFirestore = (doc: any): User => {
  const data = doc.data()
  return {
    id: doc.id,
    nombre: data.nombre,
    cedula: data.cedula,
    role: "admin",
    fechaCreacion: data.fechaCreacion.toDate(),
  }
}

// Login
export const login = async (cedula: string, password: string): Promise<User | null> => {
  try {
    // Verificar si es Super Admin
    if (cedula === SUPER_ADMIN_CREDENTIALS.cedula && password === SUPER_ADMIN_CREDENTIALS.password) {
      return {
        id: "superadmin",
        nombre: SUPER_ADMIN_CREDENTIALS.nombre,
        cedula: SUPER_ADMIN_CREDENTIALS.cedula,
        role: "superadmin",
        fechaCreacion: new Date(),
      }
    }

    // Buscar en admins de Firebase
    const q = query(collection(db, COLLECTION_NAME), where("cedula", "==", cedula), where("password", "==", password))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      toast.error("Credenciales incorrectas")
      return null
    }

    const adminDoc = querySnapshot.docs[0]
    const user = convertFromFirestore(adminDoc)
    toast.success(`Bienvenido ${user.nombre}`)
    return user
  } catch (error) {
    console.error("Error al iniciar sesión:", error)
    toast.error("Error al iniciar sesión")
    return null
  }
}

// Crear admin (solo Super Admin)
export const createAdmin = async (nombre: string, cedula: string, password: string): Promise<string> => {
  try {
    // Verificar si ya existe
    const q = query(collection(db, COLLECTION_NAME), where("cedula", "==", cedula))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      toast.error("Ya existe un administrador con esta cédula")
      throw new Error("Admin already exists")
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      nombre,
      cedula,
      password,
      fechaCreacion: Timestamp.fromDate(new Date()),
    })

    toast.success("Administrador creado correctamente")
    return docRef.id
  } catch (error) {
    console.error("Error al crear admin:", error)
    toast.error("No se pudo crear el administrador")
    throw error
  }
}

// Obtener todos los admins
export const getAllAdmins = async (): Promise<User[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME))
    return querySnapshot.docs.map(convertFromFirestore)
  } catch (error) {
    console.error("Error al obtener admins:", error)
    toast.error("No se pudieron cargar los administradores")
    return []
  }
}

// Actualizar admin
export const updateAdmin = async (id: string, nombre: string, cedula: string, password?: string): Promise<void> => {
  try {
    const adminRef = doc(db, COLLECTION_NAME, id)
    const updateData: any = {
      nombre,
      cedula,
    }
    
    // Solo actualizar contraseña si se proporciona
    if (password && password.trim() !== "") {
      updateData.password = password
    }
    
    await updateDoc(adminRef, updateData)
    toast.success("Administrador actualizado correctamente")
  } catch (error) {
    console.error("Error al actualizar admin:", error)
    toast.error("No se pudo actualizar el administrador")
    throw error
  }
}

// Eliminar admin
export const deleteAdmin = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id))
    toast.success("Administrador eliminado correctamente")
  } catch (error) {
    console.error("Error al eliminar admin:", error)
    toast.error("No se pudo eliminar el administrador")
    throw error
  }
}
