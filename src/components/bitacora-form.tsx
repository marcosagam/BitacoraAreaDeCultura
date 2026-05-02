"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format, parse } from "date-fns"
import { Button } from "../components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import type { BitacoraEntry } from "../types/bitacora"
import type { Area } from "../types/auth"
import { useEffect, useState } from "react"
import { getAllResponsables } from "../firebase/responsable-service"
import { getAllCategorias } from "../firebase/categoria-service"
import { getAllEstados } from "../firebase/estado-service"
import type { Responsable } from "../types/responsable"
import type { Categoria } from "../types/categoria"
import type { Estado } from "../types/estado"

const formSchema = z.object({
  fecha: z.string().min(1, { message: "La fecha es requerida" }),
  fechaEntrega: z.string().min(1, { message: "La fecha de entrega es requerida" }),
  titulo: z.string().min(2, { message: "El título debe tener al menos 2 caracteres" }),
  descripcion: z.string().min(5, { message: "La descripción debe tener al menos 5 caracteres" }),
  responsable: z.string({ required_error: "Por favor seleccione un responsable" }),
  categoria: z.string({ required_error: "Por favor seleccione una categoría" }),
  completada: z.boolean().optional(),
  estado: z.string().optional(),
})

interface BitacoraFormProps {
  onSubmit: (data: BitacoraEntry) => void
  initialData?: BitacoraEntry
  isEditing?: boolean
  area?: Area
}

export default function BitacoraForm({ onSubmit, initialData, isEditing = false, area = "cultura" }: BitacoraFormProps) {
  const [responsables, setResponsables] = useState<Responsable[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [estados, setEstados] = useState<Estado[]>([])
  const [loading, setLoading] = useState(true)
  const isDeporte = area === "deporte"

  const today = new Date()
  const nextWeek = new Date(today)
  nextWeek.setDate(today.getDate() + 7)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fecha: format(today, "yyyy-MM-dd"),
      fechaEntrega: format(nextWeek, "yyyy-MM-dd"),
      titulo: "",
      descripcion: "",
      responsable: "",
      categoria: "",
      completada: false,
      estado: "",
    },
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [responsablesData, categoriasData] = await Promise.all([
          getAllResponsables(area),
          getAllCategorias(area),
        ])
        setResponsables(responsablesData)
        setCategorias(categoriasData)
        if (isDeporte) {
          const estadosData = await getAllEstados()
          setEstados(estadosData)
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [area, isDeporte])

  useEffect(() => {
    if (initialData && isEditing) {
      form.reset({
        fecha: format(new Date(initialData.fecha), "yyyy-MM-dd"),
        fechaEntrega: format(new Date(initialData.fechaEntrega), "yyyy-MM-dd"),
        titulo: initialData.titulo,
        descripcion: initialData.descripcion,
        responsable: initialData.responsable,
        categoria: initialData.categoria,
        completada: initialData.completada,
        estado: initialData.estado ?? "",
      })
    }
  }, [initialData, isEditing, form])

  function handleSubmit(values: z.infer<typeof formSchema>) {
    const fechaDate = parse(values.fecha, "yyyy-MM-dd", new Date())
    const fechaEntregaDate = parse(values.fechaEntrega, "yyyy-MM-dd", new Date())

    const base = {
      ...values,
      fecha: fechaDate,
      fechaEntrega: fechaEntregaDate,
      completada: isDeporte ? false : (values.completada ?? false),
      estado: isDeporte ? (values.estado ?? "") : undefined,
    }

    if (isEditing && initialData) {
      onSubmit({ id: initialData.id, ...base, fechaCreacion: initialData.fechaCreacion } as BitacoraEntry)
    } else {
      onSubmit({ id: "", ...base, fechaCreacion: new Date() } as BitacoraEntry)
      form.reset({
        fecha: format(today, "yyyy-MM-dd"),
        fechaEntrega: format(nextWeek, "yyyy-MM-dd"),
        titulo: "",
        descripcion: "",
        responsable: "",
        categoria: "",
        completada: false,
        estado: "",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="fecha"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha del evento <span className="text-red-500">*</span></FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fechaEntrega"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de entrega <span className="text-red-500">*</span></FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="categoria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría <span className="text-red-500">*</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={loading ? "Cargando..." : "Seleccione una categoría"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="scrollable-dropdown">
                    {categorias.length === 0 ? (
                      <SelectItem value="no-categories" disabled>No hay categorías disponibles</SelectItem>
                    ) : (
                      categorias.map((c) => (
                        <SelectItem key={c.id} value={c.valor}>{c.nombre}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="responsable"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsable <span className="text-red-500">*</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={loading ? "Cargando..." : "Seleccione un responsable"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="scrollable-dropdown">
                    {responsables.length === 0 ? (
                      <SelectItem value="no-responsables" disabled>No hay responsables disponibles</SelectItem>
                    ) : (
                      responsables.map((r) => (
                        <SelectItem key={r.id} value={r.nombre}>{r.nombre}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {isDeporte && (
          <FormField
            control={form.control}
            name="estado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={loading ? "Cargando..." : "Seleccione un estado"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {estados.length === 0 ? (
                      <SelectItem value="no-estados" disabled>No hay estados disponibles</SelectItem>
                    ) : (
                      estados.map((e) => (
                        <SelectItem key={e.id} value={e.valor}>{e.nombre}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título <span className="text-red-500">*</span></FormLabel>
              <FormControl><Input placeholder="Título del registro" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Textarea placeholder="Describa los detalles del evento o actividad" className="min-h-[120px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isEditing && !isDeporte && (
          <FormField
            control={form.control}
            name="completada"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <input type="checkbox" checked={field.value} onChange={field.onChange} className="h-4 w-4 mt-1" />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Marcar como completada</FormLabel>
                </div>
              </FormItem>
            )}
          />
        )}

        {isEditing && isDeporte && (
          <FormField
            control={form.control}
            name="estado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {estados.map((e) => (
                      <SelectItem key={e.id} value={e.valor}>{e.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-full">
          {isEditing ? "Actualizar Registro" : "Guardar Registro"}
        </Button>
      </form>
    </Form>
  )
}
