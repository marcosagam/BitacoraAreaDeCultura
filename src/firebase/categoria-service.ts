import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, Timestamp } from "firebase/firestore"
import { toast } from "sonner"
import { getDbForArea, type Area } from "./config"
import type { Categoria } from "../types/categoria"

const COLLECTION_NAME = "categorias"

const convertFromFirestore = (docSnap: any): Categoria => {
  const data = docSnap.data()
  return {
    id: docSnap.id,
    nombre: data.nombre,
    valor: data.valor,
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

export const getAllCategorias = async (area: Area = "cultura"): Promise<Categoria[]> => {
  try {
    const db = getDbForArea(area)
    const q = query(collection(db, COLLECTION_NAME), orderBy("nombre", "asc"))
    const snap = await getDocs(q)
    return snap.docs.map(convertFromFirestore)
  } catch (error) {
    console.error("Error al obtener categorías:", error)
    toast.error("No se pudieron cargar las categorías")
    return []
  }
}

export const createCategoria = async (nombre: string, area: Area = "cultura"): Promise<string> => {
  try {
    const db = getDbForArea(area)
    const valor = generateValor(nombre)
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      nombre: nombre.toUpperCase(),
      valor,
      fechaCreacion: Timestamp.fromDate(new Date()),
    })
    toast.success("Categoría creada correctamente")
    return docRef.id
  } catch (error) {
    console.error("Error al crear categoría:", error)
    toast.error("No se pudo crear la categoría")
    throw error
  }
}

export const deleteCategoria = async (id: string, area: Area = "cultura"): Promise<void> => {
  try {
    const db = getDbForArea(area)
    await deleteDoc(doc(db, COLLECTION_NAME, id))
    toast.success("Categoría eliminada correctamente")
  } catch (error) {
    console.error("Error al eliminar categoría:", error)
    toast.error("No se pudo eliminar la categoría")
    throw error
  }
}
