"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog"
import { ListChecks, Trash2 } from "lucide-react"
import { getAllEstados, createEstado, deleteEstado } from "../firebase/estado-service"
import type { Estado } from "../types/estado"
import { format } from "date-fns"

const formSchema = z.object({
  nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  color: z.string().min(4, { message: "Seleccione un color" }),
})

export default function EstadosManager() {
  const [estados, setEstados] = useState<Estado[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      nombre: "",
      color: "#3b82f6"
    },
  })

  useEffect(() => { loadEstados() }, [])

  const loadEstados = async () => {
    try {
      setLoading(true)
      setEstados(await getAllEstados())
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    try {
      await createEstado(values.nombre, values.color)
      form.reset()
      loadEstados()
    } catch (error) {
      console.error("Error al crear estado:", error)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteEstado(deleteId)
      setDeleteId(null)
      loadEstados()
    } catch (error) {
      console.error("Error al eliminar estado:", error)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            Crear Estado
          </CardTitle>
          <CardDescription>Defina los estados posibles para las tareas de deporte</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Estado</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: En revisión" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color del Estado</FormLabel>
                    <div className="flex gap-3 items-center">
                      <FormControl>
                        <Input
                          type="color"
                          {...field}
                          className="w-20 h-10 cursor-pointer"
                        />
                      </FormControl>
                      <div className="flex-1">
                        <div 
                          className="h-10 rounded-md border flex items-center justify-center font-medium text-white"
                          style={{ backgroundColor: field.value }}
                        >
                          Vista previa
                        </div>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                <ListChecks className="mr-2 h-4 w-4" />
                Crear Estado
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estados Registrados</CardTitle>
          <CardDescription>Estados disponibles para clasificar tareas</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead className="w-[120px]">Color</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="w-[80px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No hay estados registrados
                      </TableCell>
                    </TableRow>
                  ) : (
                    estados.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">{e.nombre}</TableCell>
                        <TableCell className="text-sm text-gray-600">{e.valor}</TableCell>
                        <TableCell>
                          <div 
                            className="h-8 rounded-md border flex items-center justify-center text-xs font-medium text-white"
                            style={{ backgroundColor: e.color }}
                          >
                            {e.color}
                          </div>
                        </TableCell>
                        <TableCell>{format(e.fechaCreacion, "dd/MM/yyyy")}</TableCell>
                        <TableCell>
                          <Button variant="destructive" size="sm" onClick={() => setDeleteId(e.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El estado será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
