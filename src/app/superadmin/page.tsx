"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form"
import { Input } from "../../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog"
import { ArrowLeft, UserPlus, Shield, Edit, Trash2 } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { createAdmin, getAllAdmins, updateAdmin, deleteAdmin } from "../../firebase/auth-service"
import type { User } from "../../types/auth"
import { format } from "date-fns"

const formSchema = z.object({
  nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  cedula: z.string().min(5, { message: "La cédula debe tener al menos 5 caracteres" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
})

const editFormSchema = z.object({
  nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  cedula: z.string().min(5, { message: "La cédula debe tener al menos 5 caracteres" }),
  password: z.string().optional(),
})

export default function SuperAdminPage() {
  const router = useRouter()
  const { role } = useAuth()
  const [admins, setAdmins] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editingAdmin, setEditingAdmin] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      cedula: "",
      password: "",
    },
  })

  const editForm = useForm<z.infer<typeof editFormSchema>>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      nombre: "",
      cedula: "",
      password: "",
    },
  })

  useEffect(() => {
    if (role !== "superadmin") {
      router.push("/")
      return
    }

    loadAdmins()
  }, [role, router])

  const loadAdmins = async () => {
    try {
      setLoading(true)
      const data = await getAllAdmins()
      setAdmins(data)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    try {
      await createAdmin(values.nombre, values.cedula, values.password)
      form.reset()
      loadAdmins()
    } catch (error) {
      console.error("Error al crear admin:", error)
    }
  }

  const handleEdit = (admin: User) => {
    setEditingAdmin(admin)
    editForm.reset({
      nombre: admin.nombre,
      cedula: admin.cedula,
      password: "",
    })
    setIsEditDialogOpen(true)
  }

  async function handleEditSubmit(values: z.infer<typeof editFormSchema>) {
    if (!editingAdmin) return

    try {
      await updateAdmin(editingAdmin.id, values.nombre, values.cedula, values.password)
      setIsEditDialogOpen(false)
      setEditingAdmin(null)
      editForm.reset()
      loadAdmins()
    } catch (error) {
      console.error("Error al actualizar admin:", error)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      await deleteAdmin(deleteId)
      setDeleteId(null)
      loadAdmins()
    } catch (error) {
      console.error("Error al eliminar admin:", error)
    }
  }

  if (role !== "superadmin") {
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
            <Shield className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold">Panel de Super Administrador</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Crear Administrador
              </CardTitle>
              <CardDescription>Cree nuevas cuentas de administrador para el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Juan Pérez" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cedula"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cédula</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: 1234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Crear Administrador
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Administradores</CardTitle>
              <CardDescription>Administradores registrados en el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Cédula</TableHead>
                        <TableHead>Fecha Creación</TableHead>
                        <TableHead className="w-[150px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {admins.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                            No hay administradores registrados
                          </TableCell>
                        </TableRow>
                      ) : (
                        admins.map((admin) => (
                          <TableRow key={admin.id}>
                            <TableCell className="font-medium">{admin.nombre}</TableCell>
                            <TableCell>{admin.cedula}</TableCell>
                            <TableCell>{format(admin.fechaCreacion, "dd/MM/yyyy HH:mm")}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(admin)}
                                  title="Editar"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteId(admin.id)}
                                  title="Eliminar"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Diálogo de edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Administrador</DialogTitle>
            <DialogDescription>Modifique los datos del administrador</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Juan Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="cedula"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cédula</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva Contraseña (opcional)</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Dejar vacío para no cambiar" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El administrador será eliminado permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
