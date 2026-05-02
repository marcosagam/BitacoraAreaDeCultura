import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore, type Firestore } from "firebase/firestore"

export type Area = "cultura" | "deporte"

// Cultura (proyecto original)
const culturaConfig = {
  apiKey: "AIzaSyA_tkqH9M-aBK-Rgv5WwkgAk1aU_Y6VpvE",
  authDomain: "bitacoraac-44f70.firebaseapp.com",
  projectId: "bitacoraac-44f70",
  storageBucket: "bitacoraac-44f70.firebasestorage.app",
  messagingSenderId: "11870223323",
  appId: "1:11870223323:web:775ea99e4039d228f085fe",
}

// Deporte (proyecto nuevo)
const deporteConfig = {
  apiKey: "AIzaSyA0cEBd0FmF4Lh6epbU3u7KsSpVy6-lKEw",
  authDomain: "bitacoradepor.firebaseapp.com",
  projectId: "bitacoradepor",
  storageBucket: "bitacoradepor.firebasestorage.app",
  messagingSenderId: "946295618995",
  appId: "1:946295618995:web:987764bd6f1668274c9fc6",
  measurementId: "G-DM7CE3LM6L",
}

function getOrCreateApp(name: string, config: object) {
  const existing = getApps().find((a) => a.name === name)
  return existing ?? initializeApp(config, name)
}

const culturaApp = getOrCreateApp("cultura", culturaConfig)
const deporteApp = getOrCreateApp("deporte", deporteConfig)

export const culturaDb = getFirestore(culturaApp)
export const deporteDb = getFirestore(deporteApp)

// Compatibilidad: db apunta a cultura por defecto
export const db = culturaDb

export function getDbForArea(area: Area): Firestore {
  return area === "deporte" ? deporteDb : culturaDb
}

