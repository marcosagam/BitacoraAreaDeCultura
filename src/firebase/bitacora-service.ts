import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
  where,
  type QueryConstraint,
} from "firebase/firestore"
import { toast } from "sonner"
import { getDbForArea, type Area } from "./config"
import type { BitacoraEntry } from "../types/bitacora"
import { convertFromFirestore, convertToFirestore } from "../utils/firebase-helpers"

const COLLECTION_NAME = "bitacora_entries"

export const getAllEntries = async (area: Area = "cultura"): Promise<BitacoraEntry[]> => {
  try {
    const db = getDbForArea(area)
    const q = query(collection(db, COLLECTION_NAME), orderBy("fechaCreacion", "desc"))
    const snap = await getDocs(q)
    return snap.docs.map(convertFromFirestore)
  } catch (error) {
    console.error("Error al obtener entradas:", error)
    toast.error("No se pudieron cargar los registros de la bitácora")
    return []
  }
}

export const getFilteredEntries = async (
  responsable: string | null,
  estado: string | null,
  area: Area = "cultura",
): Promise<BitacoraEntry[]> => {
  try {
    const db = getDbForArea(area)
    const constraints: QueryConstraint[] = []

    if (responsable) constraints.push(where("responsable", "==", responsable))

    // Para cultura: estado es boolean (completada). Para deporte: estado es string libre.
    if (estado) {
      if (area === "cultura") {
        constraints.push(where("completada", "==", estado === "completada"))
      } else {
        constraints.push(where("estado", "==", estado))
      }
    }

    constraints.push(orderBy("fechaCreacion", "desc"))
    const q = query(collection(db, COLLECTION_NAME), ...constraints)
    const snap = await getDocs(q)
    return snap.docs.map(convertFromFirestore)
  } catch (error) {
    console.error("Error al filtrar entradas:", error)
    toast.error("No se pudieron filtrar los registros")
    return []
  }
}

export const addEntry = async (entry: Omit<BitacoraEntry, "id">, area: Area = "cultura"): Promise<string> => {
  try {
    const db = getDbForArea(area)
    const docRef = await addDoc(collection(db, COLLECTION_NAME), convertToFirestore(entry as BitacoraEntry))
    toast.success("Registro añadido correctamente")
    return docRef.id
  } catch (error) {
    console.error("Error al añadir entrada:", error)
    toast.error("No se pudo añadir el registro")
    throw error
  }
}

export const toggleEntryComplete = async (id: string, completada: boolean, area: Area = "cultura"): Promise<void> => {
  try {
    const db = getDbForArea(area)
    await updateDoc(doc(db, COLLECTION_NAME, id), { completada })
  } catch (error) {
    console.error("Error al actualizar entrada:", error)
    toast.error("No se pudo actualizar el estado de la tarea")
    throw error
  }
}

// Para deporte: actualiza el campo "estado" (string) en lugar de "completada" (boolean)
export const updateEntryEstado = async (id: string, estado: string, area: Area = "deporte"): Promise<void> => {
  try {
    const db = getDbForArea(area)
    await updateDoc(doc(db, COLLECTION_NAME, id), { estado })
    toast.success("Estado actualizado")
  } catch (error) {
    console.error("Error al actualizar estado:", error)
    toast.error("No se pudo actualizar el estado")
    throw error
  }
}

export const updateEntry = async (entry: BitacoraEntry, area: Area = "cultura"): Promise<void> => {
  try {
    const db = getDbForArea(area)
    await updateDoc(doc(db, COLLECTION_NAME, entry.id), convertToFirestore(entry))
    toast.success("Registro actualizado correctamente")
  } catch (error) {
    console.error("Error al actualizar entrada:", error)
    toast.error("No se pudo actualizar el registro")
    throw error
  }
}

export const deleteEntry = async (id: string, area: Area = "cultura"): Promise<void> => {
  try {
    const db = getDbForArea(area)
    await deleteDoc(doc(db, COLLECTION_NAME, id))
    toast.success("Registro eliminado correctamente")
  } catch (error) {
    console.error("Error al eliminar entrada:", error)
    toast.error("No se pudo eliminar el registro")
    throw error
  }
}

export const getUniqueResponsables = async (area: Area = "cultura"): Promise<string[]> => {
  try {
    const entries = await getAllEntries(area)
    const set = new Set(entries.map((e) => e.responsable))
    return Array.from(set).sort()
  } catch (error) {
    console.error("Error al obtener responsables:", error)
    return []
  }
}

export const getEntriesByTimeFilter = async (
  timeFilter: "all" | "day" | "week" | "month",
  area: Area = "cultura"
): Promise<BitacoraEntry[]> => {
  try {
    const db = getDbForArea(area)
    const constraints: QueryConstraint[] = []

    if (timeFilter !== "all") {
      const now = new Date()
      let startDate: Date

      switch (timeFilter) {
        case "day":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case "week":
          const dayOfWeek = now.getDay()
          const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff)
          break
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        default:
          startDate = new Date(0)
      }

      constraints.push(where("fechaCreacion", ">=", Timestamp.fromDate(startDate)))
    }

    constraints.push(orderBy("fechaCreacion", "desc"))
    const q = query(collection(db, COLLECTION_NAME), ...constraints)
    const snap = await getDocs(q)
    return snap.docs.map(convertFromFirestore)
  } catch (error) {
    console.error("Error al obtener entradas por filtro de tiempo:", error)
    toast.error("No se pudieron cargar los registros filtrados")
    return []
  }
}
