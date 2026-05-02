import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, Timestamp } from "firebase/firestore"
import { toast } from "sonner"
import { getDbForArea, type Area } from "./config"
import type { Responsable } from "../types/responsable"

const COLLECTION_NAME = "responsables"

const convertFromFirestore = (docSnap: any): Responsable => {
  const data = docSnap.data()
  return {
    id: docSnap.id,
    nombre: data.nombre,
    fechaCreacion: data.fechaCreacion.toDate(),
  }
}

export const getAllResponsables = async (area: Area = "cultura"): Promise<Responsable[]> => {
  try {
    const db = getDbForArea(area)
    const q = query(collection(db, COLLECTION_NAME), orderBy("nombre", "asc"))
    const snap = await getDocs(q)
    return snap.docs.map(convertFromFirestore)
  } catch (error) {
    console.error("Error al obtener responsables:", error)
    toast.error("No se pudieron cargar los responsables")
    return []
  }
}

export const createResponsable = async (nombre: string, area: Area = "cultura"): Promise<string> => {
  try {
    const db = getDbForArea(area)
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

export const deleteResponsable = async (id: string, area: Area = "cultura"): Promise<void> => {
  try {
    const db = getDbForArea(area)
    await deleteDoc(doc(db, COLLECTION_NAME, id))
    toast.success("Responsable eliminado correctamente")
  } catch (error) {
    console.error("Error al eliminar responsable:", error)
    toast.error("No se pudo eliminar el responsable")
    throw error
  }
}
