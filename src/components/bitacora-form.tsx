"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { BitacoraEntry } from "@/types/bitacora"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  fecha: z.date({
    required_error: "La fecha es requerida",
  }),
  titulo: z.string().min(2, {
    message: "El título debe tener al menos 2 caracteres",
  }),
  descripcion: z.string().min(5, {
    message: "La descripción debe tener al menos 5 caracteres",
  }),
  responsable: z.string({
    required_error: "Por favor seleccione un responsable",
  }),
  categoria: z.string({
    required_error: "Por favor seleccione una categoría",
  }),
})

interface BitacoraFormProps {
  onSubmit: (data: BitacoraEntry) => void
}

export default function BitacoraForm({ onSubmit }: BitacoraFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fecha: new Date(),
      titulo: "",
      descripcion: "",
      responsable: "",
      categoria: "",
    },
  })

  function handleSubmit(values: z.infer<typeof formSchema>) {
    onSubmit({
      id: "",
      ...values,
      fechaCreacion: new Date(),
      completada: false,
    })
    form.reset()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="fecha"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha del evento</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Seleccione una fecha</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una categoría" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="capacitacion">CAPACITACION</SelectItem>
                    <SelectItem value="convocatoria">CONVOCATORIA</SelectItem>
                    <SelectItem value="correo_electronico">CORREO ELECTRONICO</SelectItem>
                    <SelectItem value="estadistica_participacion">ESTISTICA DE PARTICIPACION</SelectItem>
                    <SelectItem value="eventos">EVENTOS</SelectItem>
                    <SelectItem value="formulario">FORMULARIO</SelectItem>
                    <SelectItem value="informe">INFORME</SelectItem>
                    <SelectItem value="ofimatica">OFIMATICA</SelectItem>
                    <SelectItem value="participacion">PARTICIPACION</SelectItem>
                    <SelectItem value="prestamo">PRESTAMO</SelectItem>
                    <SelectItem value="prestamo_equipos_sonido">PRESTAMO DE EQUIPOS DE SONIDO</SelectItem>
                    <SelectItem value="propuesta">PROPUESTA</SelectItem>
                    <SelectItem value="publicacion_redes">PUBLICACION EN REDES SOCIALES</SelectItem>
                    <SelectItem value="reunion">REUNION</SelectItem>
                    <SelectItem value="solicitud">SOLICITUD</SelectItem>
                    <SelectItem value="tareas_bodega">TAREAS DE BODEGA</SelectItem>
                    <SelectItem value="tareas_oficina">TAREAS GENERALES DE OFICINA</SelectItem>
                    <SelectItem value="uniformes">UNIFORMES</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Título del registro" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describa los detalles del evento o actividad"
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="responsable"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsable</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un responsable" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ALEJANDRO GOMEZ COBO">ALEJANDRO GOMEZ COBO</SelectItem>
                  <SelectItem value="ANGIE NATALIA SANTANA ROJAS">ANGIE NATALIA SANTANA ROJAS</SelectItem>
                  <SelectItem value="ASHLY CAICEDO">ASHLY CAICEDO</SelectItem>
                  <SelectItem value="DIANA MARULANDA">DIANA MARULANDA</SelectItem>
                  <SelectItem value="EDUARD LUBO URBANO">EDUARD LUBO URBANO</SelectItem>
                  <SelectItem value="EDWIN PORTELA">EDWIN PORTELA</SelectItem>
                  <SelectItem value="FRANCISCO EMERSON CASTAÑEDA RAMIREZ">
                    FRANCISCO EMERSON CASTAÑEDA RAMIREZ
                  </SelectItem>
                  <SelectItem value="ISABELA OBREGON">ISABELA OBREGON</SelectItem>
                  <SelectItem value="IVÁN FERNANDO VASQUEZ MANCILLA">IVÁN FERNANDO VASQUEZ MANCILLA</SelectItem>
                  <SelectItem value="JUAN DAVID TABARES">JUAN DAVID TABARES</SelectItem>
                  <SelectItem value="JUAN PABLO CRUZ">JUAN PABLO CRUZ</SelectItem>
                  <SelectItem value="KERELYN GRUTIERREZ VENECIA">KERELYN GRUTIERREZ VENECIA</SelectItem>
                  <SelectItem value="LUIS SANTIAGO AZA JARAMILLO">LUIS SANTIAGO AZA JARAMILLO</SelectItem>
                  <SelectItem value="MARCOS AMILKAR MURILLO AGAMEZ">MARCOS AMILKAR MURILLO AGAMEZ</SelectItem>
                  <SelectItem value="SANTIAGO FERNANDO NACED ROJAS">SANTIAGO FERNANDO NACED ROJAS</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Guardar Registro
        </Button>
      </form>
    </Form>
  )
}

