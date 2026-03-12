import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, Timestamp } from "firebase/firestore"
import { toast } from "sonner"
import { db } from "./config"
import type { Categoria } from "../types/categoria"

const COLLECTION_NAME = "categorias"

// Convertir datos de Firestore a Categoria
const convertFromFirestore = (doc: any): Categoria => {
  const data = doc.data()
  return {
    id: doc.id,
    nombre: data.nombre,
    valor: data.valor,
    fechaCreacion: data.fechaCreacion.toDate(),
  }
}

// Generar valor a partir del nombre
const generateValor = (nombre: string): string => {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
    .replace(/[^a-z0-9\s]/g, "") // Eliminar caracteres especiales
    .trim()
    .replace(/\s+/g, "_") // Reemplazar espacios con guión bajo
}

// Obtener todas las categorías
export const getAllCategorias = async (): Promise<Categoria[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("nombre", "asc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(convertFromFirestore)
  } catch (error) {
    console.error("Error al obtener categorías:", error)
    toast.error("No se pudieron cargar las categorías")
    return []
  }
}

// Crear categoría
export const createCategoria = async (nombre: string): Promise<string> => {
  try {
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

// Eliminar categoría
export const deleteCategoria = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id))
    toast.success("Categoría eliminada correctamente")
  } catch (error) {
    console.error("Error al eliminar categoría:", error)
    toast.error("No se pudo eliminar la categoría")
    throw error
  }
}
