import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, Timestamp } from "firebase/firestore"
import { toast } from "sonner"
import { db } from "./config"
import type { Responsable } from "../types/responsable"

const COLLECTION_NAME = "responsables"

// Convertir datos de Firestore a Responsable
const convertFromFirestore = (doc: any): Responsable => {
  const data = doc.data()
  return {
    id: doc.id,
    nombre: data.nombre,
    fechaCreacion: data.fechaCreacion.toDate(),
  }
}

// Obtener todos los responsables
export const getAllResponsables = async (): Promise<Responsable[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("nombre", "asc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(convertFromFirestore)
  } catch (error) {
    console.error("Error al obtener responsables:", error)
    toast.error("No se pudieron cargar los responsables")
    return []
  }
}

// Crear responsable
export const createResponsable = async (nombre: string): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      nombre: nombre.toUpperCase(),
      fechaCreacion: Timestamp.fromDate(new Date()),
    })

    toast.success("Responsable creado correctamente")
    return docRef.id
  } catch (error) {
    console.error("Error al crear responsable:", error)
    toast.error("No se pudo crear el responsable")
    throw error
  }
}

// Eliminar responsable
export const deleteResponsable = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id))
    toast.success("Responsable eliminado correctamente")
  } catch (error) {
    console.error("Error al eliminar responsable:", error)
    toast.error("No se pudo eliminar el responsable")
    throw error
  }
}
