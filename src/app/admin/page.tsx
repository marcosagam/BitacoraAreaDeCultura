"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { ArrowLeft, Settings } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import ResponsablesManager from "../../components/responsables-manager"
import CategoriasManager from "../../components/categorias-manager"

export default function AdminPage() {
  const router = useRouter()
  const { role } = useAuth()

  useEffect(() => {
    if (role !== "admin" && role !== "superadmin") {
      router.push("/")
    }
  }, [role, router])

  if (role !== "admin" && role !== "superadmin") {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => router.push("/")} size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Settings className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Panel de Administración</h1>
          </div>
        </div>

        <Tabs defaultValue="responsables" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="responsables">Responsables</TabsTrigger>
            <TabsTrigger value="categorias">Categorías</TabsTrigger>
          </TabsList>

          <TabsContent value="responsables">
            <ResponsablesManager />
          </TabsContent>

          <TabsContent value="categorias">
            <CategoriasManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
