"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"

import { Button } from "../components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form"
import { Input } from "../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion"
import { Alert, AlertDescription } from "../components/ui/alert"
import type { AsistenciaEntry } from "../types/asistencia"
import { useState } from "react"
import { useGeolocation } from "../hooks/useGeolocation"
import { MapPin, CheckCircle, XCircle, Loader2, LogIn, LogOut, Building2, Users } from "lucide-react"
import { NOMBRES_MONITORES, NOMBRES_MONITORES_AUDITORIO } from "../constants/nombres"

const formSchema = z.object({
  espacio: z.enum(["oficina", "auditorio"], {
    required_error: "Debe seleccionar el espacio",
  }),
  nombre: z.string().min(1, { message: "Debe seleccionar un nombre" }),
  fecha: z.string().min(1, { message: "La fecha es requerida" }),
  hora: z.string().min(1, { message: "La hora es requerida" }),
  tipo: z.enum(["entrada", "salida"], {
    required_error: "Debe seleccionar el tipo de registro",
  }),
})

interface AsistenciaFormProps {
  onSubmit: (data: AsistenciaEntry) => void
  onNameChange?: (name: string) => void
  onEspacioChange?: (espacio: "oficina" | "auditorio") => void
}

// Ubicaciones permitidas
const ALLOWED_LOCATIONS = [
  {
    latitude: 3.372007,
    longitude: -76.534116,
    name: "Ubicación 1"
  },
  {
    latitude: 3.375805,
    longitude: -76.532798,
    name: "Ubicación 2"
  }
]
const ALLOWED_RANGE = 300 // metros

export default function AsistenciaForm({ onSubmit, onNameChange, onEspacioChange }: AsistenciaFormProps) {
  const [selectedNombre, setSelectedNombre] = useState<string>("")
  const [selectedEspacio, setSelectedEspacio] = useState<"oficina" | "auditorio">("oficina")

  // Hook de geolocalización
  const geoLocation = useGeolocation({
    targetLocations: ALLOWED_LOCATIONS,
    allowedRange: ALLOWED_RANGE,
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 30000,
  })

  const now = new Date()
  const currentTime = format(now, "HH:mm")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      espacio: "oficina",
      nombre: "",
      fecha: format(now, "yyyy-MM-dd"),
      hora: currentTime,
      tipo: "entrada",
    },
  })

  function handleSubmit(values: z.infer<typeof formSchema>) {
    if (!geoLocation.isInRange || !geoLocation.latitude || !geoLocation.longitude) {
      return
    }

    onSubmit({
      id: "",
      nombre: values.nombre,
      fecha: new Date(values.fecha),
      hora: values.hora,
      tipo: values.tipo,
      espacio: values.espacio,
      fechaCreacion: new Date(),
      latitud: geoLocation.latitude,
      longitud: geoLocation.longitude,
      distancia: geoLocation.distance || 0,
    })

    // Reset form
    form.reset({
      espacio: values.espacio,
      nombre: "",
      fecha: format(now, "yyyy-MM-dd"),
      hora: currentTime,
      tipo: "entrada",
    })
    setSelectedNombre("")
  }

  const handleNombreSelect = (nombre: string) => {
    setSelectedNombre(nombre)
    form.setValue("nombre", nombre)
    onNameChange?.(nombre)
  }

  const getLocationStatusColor = () => {
    if (geoLocation.loading) return "bg-yellow-50 border-yellow-200"
    if (geoLocation.error) return "bg-red-50 border-red-200"
    if (geoLocation.isInRange) return "bg-green-50 border-green-200"
    return "bg-red-50 border-red-200"
  }

  const getLocationStatusIcon = () => {
    if (geoLocation.loading) return <Loader2 className="h-5 w-5 animate-spin text-yellow-600" />
    if (geoLocation.error) return <XCircle className="h-5 w-5 text-red-600" />
    if (geoLocation.isInRange) return <CheckCircle className="h-5 w-5 text-green-600" />
    return <XCircle className="h-5 w-5 text-red-600" />
  }

  const getLocationStatusText = () => {
    if (geoLocation.loading) return "Obteniendo ubicación..."
    if (geoLocation.error) return geoLocation.error
    if (geoLocation.isInRange) {
      return `Ubicación válida - Distancia: ${geoLocation.distance?.toFixed(1)}m`
    }
    return `Fuera del rango permitido - Distancia: ${geoLocation.distance?.toFixed(1)}m (máximo ${ALLOWED_RANGE}m)`
  }

  const isFormDisabled = !geoLocation.isInRange || geoLocation.loading || !!geoLocation.error

  const selectedTipo = form.watch("tipo")
  const selectedEspacioValue = form.watch("espacio")
  
  // Obtener la lista de nombres según el espacio seleccionado
  const nombresDisponibles = selectedEspacioValue === "oficina" ? NOMBRES_MONITORES : NOMBRES_MONITORES_AUDITORIO

  return (
    <div className="space-y-6">
      {/* Estado de la ubicación GPS */}
      <Alert className={getLocationStatusColor()}>
        <div className="flex items-center space-x-2">
          {getLocationStatusIcon()}
          <div className="flex-1">
            <AlertDescription className="font-medium">{getLocationStatusText()}</AlertDescription>
            {geoLocation.latitude && geoLocation.longitude && (
              <div className="text-xs text-gray-600 mt-1">
                <MapPin className="h-3 w-3 inline mr-1" />
                Lat: {geoLocation.latitude.toFixed(6)}, Lng: {geoLocation.longitude.toFixed(6)}
                {geoLocation.accuracy && ` (±${geoLocation.accuracy.toFixed(0)}m)`}
              </div>
            )}
          </div>
        </div>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Selector de Espacio */}
          <FormField
            control={form.control}
            name="espacio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Espacio <span className="text-red-500">*</span>
                </FormLabel>
                <Select 
                  onValueChange={(value) => {
                    const espacioValue = value as "oficina" | "auditorio"
                    field.onChange(value)
                    setSelectedEspacio(espacioValue)
                    onEspacioChange?.(espacioValue)
                    // Limpiar nombre seleccionado al cambiar de espacio
                    setSelectedNombre("")
                    form.setValue("nombre", "")
                  }} 
                  value={field.value} 
                  disabled={isFormDisabled}
                >
                  <FormControl>
                    <SelectTrigger className="border-blue-300 bg-blue-50">
                      <SelectValue placeholder="Seleccione el espacio" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="oficina">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        <span>Oficina</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="auditorio">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-purple-600" />
                        <span>Auditorio</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tipo de registro */}
          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Tipo de registro <span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isFormDisabled}>
                  <FormControl>
                    <SelectTrigger
                      className={`${selectedTipo === "entrada" ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"}`}
                    >
                      <SelectValue placeholder="Seleccione el tipo de registro" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="entrada">
                      <div className="flex items-center space-x-2">
                        <LogIn className="h-4 w-4 text-green-600" />
                        <span>Entrada al trabajo</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="salida">
                      <div className="flex items-center space-x-2">
                        <LogOut className="h-4 w-4 text-red-600" />
                        <span>Salida del trabajo</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Nombre <span className="text-red-500">*</span>
                </FormLabel>
                <div className="space-y-2">
                  {selectedNombre && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm font-medium text-green-800">Seleccionado: {selectedNombre}</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2 bg-transparent"
                        disabled={isFormDisabled}
                        onClick={() => {
                          setSelectedNombre("")
                          form.setValue("nombre", "")
                        }}
                      >
                        Cambiar selección
                      </Button>
                    </div>
                  )}
                  {!selectedNombre && (
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="nombres">
                        <AccordionTrigger disabled={isFormDisabled}>
                          {isFormDisabled ? "Esperando ubicación válida..." : "Seleccionar nombre"}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid gap-2 max-h-60 overflow-y-auto">
                            {nombresDisponibles.map((nombre) => (
                              <Button
                                key={nombre}
                                type="button"
                                variant="outline"
                                className="justify-start text-left h-auto p-3 bg-transparent"
                                disabled={isFormDisabled}
                                onClick={() => handleNombreSelect(nombre)}
                              >
                                {nombre}
                              </Button>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="fecha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Fecha <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="date" disabled={isFormDisabled} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hora"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Hora <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="time" disabled={isFormDisabled} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            className={`w-full ${selectedTipo === "entrada" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
            disabled={!selectedNombre || isFormDisabled}
          >
            {geoLocation.loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando ubicación...
              </>
            ) : !geoLocation.isInRange ? (
              "Ubicación fuera del rango permitido"
            ) : (
              <>
                {selectedTipo === "entrada" ? <LogIn className="mr-2 h-4 w-4" /> : <LogOut className="mr-2 h-4 w-4" />}
                Registrar {selectedTipo === "entrada" ? "Entrada" : "Salida"}
              </>
            )}
          </Button>

          {!geoLocation.isInRange && !geoLocation.loading && !geoLocation.error && (
            <div className="text-center text-sm text-red-600">
              <p>
                Debe estar dentro de un rango de {ALLOWED_RANGE} metros de la ubicación de trabajo para registrar
                asistencia.
              </p>
            </div>
          )}
        </form>
      </Form>
    </div>
  )
}
