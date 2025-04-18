import { Timestamp } from "firebase/firestore"
import type { BitacoraEntry } from "../types/bitacora"

// Convertir datos de Firestore a nuestro tipo BitacoraEntry
export const convertFromFirestore = (doc: any): BitacoraEntry => {
  const data = doc.data()
  return {
    id: doc.id,
    titulo: data.titulo,
    descripcion: data.descripcion,
    responsable: data.responsable,
    categoria: data.categoria,
    fecha: data.fecha.toDate(),
    fechaEntrega: data.fechaEntrega
      ? data.fechaEntrega.toDate()
      : new Date(data.fecha.toDate().getTime() + 7 * 24 * 60 * 60 * 1000), // Si no existe, una semana después de la fecha
    fechaCreacion: data.fechaCreacion.toDate(),
    completada: data.completada,
  }
}

// Convertir nuestro tipo BitacoraEntry a formato para Firestore
export const convertToFirestore = (entry: BitacoraEntry) => {
  return {
    titulo: entry.titulo,
    descripcion: entry.descripcion,
    responsable: entry.responsable,
    categoria: entry.categoria,
    fecha: Timestamp.fromDate(new Date(entry.fecha)),
    fechaEntrega: Timestamp.fromDate(new Date(entry.fechaEntrega)),
    fechaCreacion: Timestamp.fromDate(new Date(entry.fechaCreacion)),
    completada: entry.completada,
  }
}
