/**
 * Servicio de estados dinámicos para el área de deporte.
 * El admin de deporte puede crear sus propios estados (ej: "En revisión", "Aprobado", etc.)
 */
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, Timestamp } from "firebase/firestore"
import { toast } from "sonner"
import { deporteDb } from "./config"
import type { Estado } from "../types/estado"

const COLLECTION_NAME = "estados"

const convertFromFirestore = (docSnap: any): Estado => {
  const data = docSnap.data()
  return {
    id: docSnap.id,
    nombre: data.nombre,
    valor: data.valor,
    color: data.color,
    fechaCreacion: data.fechaCreacion.toDate(),
  }
}

const generateValor = (nombre: string): string =>
  nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "_")

export const getAllEstados = async (): Promise<Estado[]> => {
  try {
    const q = query(collection(deporteDb, COLLECTION_NAME), orderBy("nombre", "asc"))
    const snap = await getDocs(q)
    return snap.docs.map(convertFromFirestore)
  } catch (error) {
    console.error("Error al obtener estados:", error)
    toast.error("No se pudieron cargar los estados")
    return []
  }
}

export const createEstado = async (nombre: string, color: string): Promise<string> => {
  try {
    const valor = generateValor(nombre)
    const docRef = await addDoc(collection(deporteDb, COLLECTION_NAME), {
      nombre: nombre.toUpperCase(),
      valor,
      color,
      fechaCreacion: Timestamp.fromDate(new Date()),
    })
    toast.success("Estado creado correctamente")
    return docRef.id
  } catch (error) {
    console.error("Error al crear estado:", error)
    toast.error("No se pudo crear el estado")
    throw error
  }
}

export const deleteEstado = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(deporteDb, COLLECTION_NAME, id))
    toast.success("Estado eliminado correctamente")
  } catch (error) {
    console.error("Error al eliminar estado:", error)
    toast.error("No se pudo eliminar el estado")
    throw error
  }
}
