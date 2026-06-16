import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import { AuthProvider } from "../contexts/AuthContext"
import AreaUrlSync from "../components/area-url-sync"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Bitácora de Registros",
  description: "Sistema de gestión de bitácora de registros y tareas",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-white`}>
        <AuthProvider>
          <Suspense fallback={null}>
            <AreaUrlSync />
          </Suspense>
          {children}
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  )
}
