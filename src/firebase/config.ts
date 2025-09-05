// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

// Tu configuración de Firebase
// Reemplaza estos valores con los de tu proyecto de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAAZlpaeENavr-DkaoUOtJEZY5t0HAlrZk",
  authDomain: "bitaoraco.firebaseapp.com",
  projectId: "bitaoraco",
  storageBucket: "bitaoraco.firebasestorage.app",
  messagingSenderId: "867368525112",
  appId: "1:867368525112:web:f3965f5cbc979c8dc7b5cd",
  measurementId: "G-Y6Q492PT4X"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

