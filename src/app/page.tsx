"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { toast } from "sonner"
import BitacoraForm from "../components/bitacora-form"
import BitacoraTable from "../components/bitacora-table"
import BitacoraStats from "../components/bitacora-stats"
import BitacoraFilter from "../components/bitacora-filter"
import type { BitacoraEntry } from "../types/bitacora"
import {
  getAllEntries,
  addEntry as addEntryToFirebase,
  toggleEntryComplete,
  getFilteredEntries,
  getUniqueResponsables,
  getUniqueCategorias,
} from "../firebase/bitacora-service"

export default function BitacoraPage() {
  const [entries, setEntries] = useState<BitacoraEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<BitacoraEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [responsables, setResponsables] = useState<string[]>([])
  const [categorias, setCategorias] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState("form")

  // Cargar entradas desde Firebase al iniciar
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [data, uniqueResponsables, uniqueCategorias] = await Promise.all([
          getAllEntries(),
          getUniqueResponsables(),
          getUniqueCategorias(),
        ])

        setEntries(data)
        setFilteredEntries(data)
        setResponsables(uniqueResponsables)
        setCategorias(uniqueCategorias)
      } catch (error) {
        console.error("Error al cargar datos:", error)
        toast.error("No se pudieron cargar los datos")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const addEntry = async (entry: Omit<BitacoraEntry, "id">) => {
    try {
      const id = await addEntryToFirebase(entry)

      const newEntry = {
        ...entry,
        id,
      } as BitacoraEntry

      // Actualizar el estado local con la nueva entrada
      setEntries((prevEntries) => [newEntry, ...prevEntries])
      setFilteredEntries((prevEntries) => [newEntry, ...prevEntries])

      // Actualizar responsables y categorías si es necesario
      if (!responsables.includes(entry.responsable)) {
        setResponsables((prev) => [...prev, entry.responsable].sort())
      }

      if (!Object.keys(categorias).includes(entry.categoria)) {
        const labels: Record<string, string> = {
          capacitacion: "CAPACITACION",
          convocatoria: "CONVOCATORIA",
          correo_electronico: "CORREO ELECTRONICO",
          estadistica_participacion: "ESTISTICA DE PARTICIPACION",
          eventos: "EVENTOS",
          formulario: "FORMULARIO",
          informe: "INFORME",
          ofimatica: "OFIMATICA",
          participacion: "PARTICIPACION",
          prestamo: "PRESTAMO",
          prestamo_equipos_sonido: "PRESTAMO DE EQUIPOS DE SONIDO",
          propuesta: "PROPUESTA",
          publicacion_redes: "PUBLICACION EN REDES SOCIALES",
          reunion: "REUNION",
          solicitud: "SOLICITUD",
          tareas_bodega: "TAREAS DE BODEGA",
          tareas_oficina: "TAREAS GENERALES DE OFICINA",
          uniformes: "UNIFORMES",
        }

        setCategorias((prev) => ({
          ...prev,
          [entry.categoria]: labels[entry.categoria as keyof typeof labels] || entry.categoria,
        }))
      }

      toast.success("Registro añadido correctamente")
    } catch (error) {
      console.error("Error al añadir entrada:", error)
      toast.error("No se pudo añadir el registro")
    }
  }

  const handleToggleComplete = async (id: string) => {
    try {
      // Encontrar la entrada actual y su estado
      const entry = entries.find((e) => e.id === id)
      if (!entry) return

      // Actualizar en Firebase
      await toggleEntryComplete(id, !entry.completada)

      // Actualizar el estado local
      const updatedEntries = entries.map((entry) =>
        entry.id === id ? { ...entry, completada: !entry.completada } : entry,
      )

      setEntries(updatedEntries)

      // También actualizar las entradas filtradas
      setFilteredEntries((prevFiltered) =>
        prevFiltered.map((entry) => (entry.id === id ? { ...entry, completada: !entry.completada } : entry)),
      )

      toast.success(`Tarea marcada como ${!entry.completada ? "completada" : "pendiente"}`)
    } catch (error) {
      console.error("Error al actualizar entrada:", error)
      toast.error("No se pudo actualizar el estado de la tarea")
    }
  }

  const handleFilter = async (responsable: string | null, categoria: string | null) => {
    try {
      setLoading(true)

      if (!responsable && !categoria) {
        // Si no hay filtros, mostrar todas las entradas
        setFilteredEntries(entries)
      } else {
        // Filtrar localmente si ya tenemos los datos
        if (entries.length > 0) {
          let filtered = [...entries]

          if (responsable) {
            filtered = filtered.filter((entry) => entry.responsable === responsable)
          }

          if (categoria) {
            filtered = filtered.filter((entry) => entry.categoria === categoria)
          }

          setFilteredEntries(filtered)
        } else {
          // O consultar a Firebase si es necesario
          const filtered = await getFilteredEntries(responsable, categoria)
          setFilteredEntries(filtered)
        }
      }
    } catch (error) {
      console.error("Error al filtrar entradas:", error)
      toast.error("No se pudieron filtrar los registros")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Bitácora de Registros</h1>

      <Tabs defaultValue="form" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="form">Nuevo Registro</TabsTrigger>
          <TabsTrigger value="entries">Ver Registros</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="form">
          <Card>
            <CardHeader>
              <CardTitle>Nuevo Registro en Bitácora</CardTitle>
              <CardDescription>Complete el formulario para añadir un nuevo registro a la bitácora.</CardDescription>
            </CardHeader>
            <CardContent>
              <BitacoraForm onSubmit={addEntry} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entries">
          <Card>
            <CardHeader>
              <CardTitle>Registros de la Bitácora</CardTitle>
              <CardDescription>Visualice y filtre los registros guardados en la bitácora.</CardDescription>
            </CardHeader>
            <CardContent>
              <BitacoraFilter responsables={responsables} categorias={categorias} onFilter={handleFilter} />

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <BitacoraTable entries={filteredEntries} onToggleComplete={handleToggleComplete} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <BitacoraStats entries={entries} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

