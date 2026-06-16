"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "./ui/button"
import { LogIn, LogOut, Shield, Settings } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import LoginDialog from "./login-dialog"
import AreaSwitcher from "./area-switcher"

export default function AppHeader() {
  const router = useRouter()
  const { user, isAuthenticated, role, logout } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <>
      <div className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-800">Sistema de Gestión</h1>
          </div>

          <div className="flex items-center gap-2">
            <AreaSwitcher />

            {!isAuthenticated ? (
              <Button onClick={() => setLoginOpen(true)} variant="default">
                <LogIn className="mr-2 h-4 w-4" />
                Iniciar Sesión
              </Button>
            ) : (
              <>
                {role === "superadmin" && (
                  <Button onClick={() => router.push("/superadmin")} variant="outline" className="gap-2">
                    <Shield className="h-4 w-4" />
                    Super Admin
                  </Button>
                )}

                {(role === "admin" || role === "superadmin") && (
                  <Button onClick={() => router.push("/admin")} variant="outline" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Administrar
                  </Button>
                )}

                <Button onClick={handleLogout} variant="outline" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                  <LogOut className="h-4 w-4" />
                  Cerrar Sesión
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  )
}
