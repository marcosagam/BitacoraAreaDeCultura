// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

// Tu configuración de Firebase
// Reemplaza estos valores con los de tu proyecto de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA_tkqH9M-aBK-Rgv5WwkgAk1aU_Y6VpvE",
  authDomain: "bitacoraac-44f70.firebaseapp.com",
  projectId: "bitacoraac-44f70",
  storageBucket: "bitacoraac-44f70.firebasestorage.app",
  messagingSenderId: "11870223323",
  appId: "1:11870223323:web:775ea99e4039d228f085fe",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

