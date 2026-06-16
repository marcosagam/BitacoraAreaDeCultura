import { collection, addDoc, getDocs, query, where, Timestamp, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { toast } from "sonner"
import { culturaDb, deporteDb } from "./config"
import type { User, Area } from "../types/auth"
import { areaFromSource } from "../lib/area"
import { SUPER_ADMIN_CREDENTIALS } from "../constants/superadmin"

const COLLECTION_NAME = "admins"

// Convertir datos de Firestore a User
const convertFromFirestore = (docSnap: { id: string; data: () => Record<string, unknown> }, sourceArea: Area): User => {
  const data = docSnap.data()
  return {
    id: docSnap.id,
    nombre: data.nombre as string,
    cedula: data.cedula as string,
    role: "admin",
    area: areaFromSource(sourceArea, data.area),
    fechaCreacion: (data.fechaCreacion as Timestamp).toDate(),
  }
}

// Login — busca en ambas bases de datos
export const login = async (cedula: string, password: string): Promise<User | null> => {
  try {
    // Verificar si es Super Admin
    if (cedula === SUPER_ADMIN_CREDENTIALS.cedula && password === SUPER_ADMIN_CREDENTIALS.password) {
      return {
        id: "superadmin",
        nombre: SUPER_ADMIN_CREDENTIALS.nombre,
        cedula: SUPER_ADMIN_CREDENTIALS.cedula,
        role: "superadmin",
        area: "cultura",
        fechaCreacion: new Date(),
      }
    }

    // Buscar en cultura primero, luego en deporte
    for (const { db, area: sourceArea } of [
      { db: culturaDb, area: "cultura" as Area },
      { db: deporteDb, area: "deporte" as Area },
    ]) {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("cedula", "==", cedula),
        where("password", "==", password),
      )
      const snap = await getDocs(q)
      if (!snap.empty) {
        const user = convertFromFirestore(snap.docs[0], sourceArea)
        toast.success(`Bienvenido ${user.nombre}`)
        return user
      }
    }

    toast.error("Credenciales incorrectas")
    return null
  } catch (error) {
    console.error("Error al iniciar sesión:", error)
    toast.error("Error al iniciar sesión")
    return null
  }
}

// Crear admin (solo Super Admin) — guarda en la DB del área correspondiente
export const createAdmin = async (
  nombre: string,
  cedula: string,
  password: string,
  area: Area = "cultura",
): Promise<string> => {
  try {
    const db = area === "deporte" ? deporteDb : culturaDb

    // Verificar si ya existe en esa área
    const q = query(collection(db, COLLECTION_NAME), where("cedula", "==", cedula))
    const snap = await getDocs(q)

    if (!snap.empty) {
      toast.error("Ya existe un administrador con esta cédula en esa área")
      throw new Error("Admin already exists")
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      nombre,
      cedula,
      password,
      area,
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

// Obtener todos los admins de ambas áreas
export const getAllAdmins = async (): Promise<User[]> => {
  try {
    const [culturaSnap, deporteSnap] = await Promise.all([
      getDocs(collection(culturaDb, COLLECTION_NAME)),
      getDocs(collection(deporteDb, COLLECTION_NAME)),
    ])
    return [
      ...culturaSnap.docs.map((docSnap) => convertFromFirestore(docSnap, "cultura")),
      ...deporteSnap.docs.map((docSnap) => convertFromFirestore(docSnap, "deporte")),
    ]
  } catch (error) {
    console.error("Error al obtener admins:", error)
    toast.error("No se pudieron cargar los administradores")
    return []
  }
}

// Actualizar admin — busca en la DB correcta según área
export const updateAdmin = async (
  id: string,
  nombre: string,
  cedula: string,
  area: Area,
  password?: string,
): Promise<void> => {
  try {
    const db = area === "deporte" ? deporteDb : culturaDb
    const adminRef = doc(db, COLLECTION_NAME, id)
    const updateData: any = { nombre, cedula, area }
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

// Eliminar admin — busca en ambas DBs
export const deleteAdmin = async (id: string, area: Area): Promise<void> => {
  try {
    const db = area === "deporte" ? deporteDb : culturaDb
    await deleteDoc(doc(db, COLLECTION_NAME, id))
    toast.success("Administrador eliminado correctamente")
  } catch (error) {
    console.error("Error al eliminar admin:", error)
    toast.error("No se pudo eliminar el administrador")
    throw error
  }
}
