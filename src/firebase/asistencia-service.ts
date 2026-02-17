import { collection, addDoc, getDocs, query, orderBy, Timestamp } from "firebase/firestore"
import { toast } from "sonner"
import { db } from "./config"
import type { AsistenciaEntry } from "../types/asistencia"

// Colección de Firestore
const COLLECTION_NAME = "asistencia_entries"

// Convertir datos de Firestore a nuestro tipo AsistenciaEntry
const convertFromFirestore = (doc: any): AsistenciaEntry => {
  const data = doc.data()
  return {
    id: doc.id,
    nombre: data.nombre,
    fecha: data.fecha.toDate(),
    hora: data.hora,
    tipo: data.tipo || "entrada",
    espacio: data.espacio || "oficina",
    fechaCreacion: data.fechaCreacion.toDate(),
    latitud: data.latitud || 0,
    longitud: data.longitud || 0,
    distancia: data.distancia || 0,
  }
}

// Convertir nuestro tipo AsistenciaEntry a formato para Firestore
const convertToFirestore = (entry: AsistenciaEntry) => {
  return {
    nombre: entry.nombre,
    fecha: Timestamp.fromDate(new Date(entry.fecha)),
    hora: entry.hora,
    tipo: entry.tipo,
    espacio: entry.espacio,
    fechaCreacion: Timestamp.fromDate(new Date(entry.fechaCreacion)),
    latitud: entry.latitud,
    longitud: entry.longitud,
    distancia: entry.distancia || 0,
  }
}

// Obtener todas las entradas de asistencia
export const getAllAsistencias = async (): Promise<AsistenciaEntry[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("fechaCreacion", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(convertFromFirestore)
  } catch (error) {
    console.error("Error al obtener asistencias:", error)
    toast.error("No se pudieron cargar los registros de asistencia")
    return []
  }
}

// Añadir una nueva entrada de asistencia
export const addAsistencia = async (entry: Omit<AsistenciaEntry, "id">): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), convertToFirestore(entry as AsistenciaEntry))
    toast.success(`${entry.tipo === "entrada" ? "Entrada" : "Salida"} registrada correctamente`)
    return docRef.id
  } catch (error) {
    console.error("Error al registrar asistencia:", error)
    toast.error("No se pudo registrar la asistencia")
    throw error
  }
}
