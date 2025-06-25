"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { toast } from "sonner"
import BitacoraForm from "../components/bitacora-form"
import BitacoraTable from "../components/bitacora-table"
import BitacoraStats from "../components/bitacora-stats"
import BitacoraFilter from "../components/bitacora-filter"
import AsistenciaForm from "../components/asistencia-form"
import AsistenciaTable from "../components/asistencia-table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog"
import type { BitacoraEntry } from "../types/bitacora"
import type { AsistenciaEntry } from "../types/asistencia"
import {
  getAllEntries,
  addEntry as addEntryToFirebase,
  toggleEntryComplete,
  getFilteredEntries,
  getUniqueResponsables,
  updateEntry,
} from "../firebase/bitacora-service"
import { getAllAsistencias, addAsistencia } from "../firebase/asistencia-service"

export default function BitacoraPage() {
  const [entries, setEntries] = useState<BitacoraEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<BitacoraEntry[]>([])
  const [asistencias, setAsistencias] = useState<AsistenciaEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingAsistencias, setLoadingAsistencias] = useState(true)
  const [responsables, setResponsables] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("form")
  const [editingEntry, setEditingEntry] = useState<BitacoraEntry | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Cargar entradas desde Firebase al iniciar
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [data, uniqueResponsables] = await Promise.all([getAllEntries(), getUniqueResponsables()])

        setEntries(data)
        setFilteredEntries(data)
        setResponsables(uniqueResponsables)
      } catch (error) {
        console.error("Error al cargar datos:", error)
        toast.error("No se pudieron cargar los datos")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Cargar asistencias desde Firebase
  useEffect(() => {
    const fetchAsistencias = async () => {
      try {
        setLoadingAsistencias(true)
        const data = await getAllAsistencias()
        setAsistencias(data)
      } catch (error) {
        console.error("Error al cargar asistencias:", error)
        toast.error("No se pudieron cargar las asistencias")
      } finally {
        setLoadingAsistencias(false)
      }
    }

    fetchAsistencias()
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

      // Actualizar responsables si es necesario
      if (!responsables.includes(entry.responsable)) {
        setResponsables((prev) => [...prev, entry.responsable].sort())
      }

      toast.success("Registro añadido correctamente")
    } catch (error) {
      console.error("Error al añadir entrada:", error)
      toast.error("No se pudo añadir el registro")
    }
  }

  const addAsistenciaEntry = async (entry: Omit<AsistenciaEntry, "id">) => {
    try {
      const id = await addAsistencia(entry)

      const newEntry = {
        ...entry,
        id,
      } as AsistenciaEntry

      // Actualizar el estado local con la nueva entrada
      setAsistencias((prevEntries) => [newEntry, ...prevEntries])

      toast.success("Asistencia registrada correctamente")
    } catch (error) {
      console.error("Error al registrar asistencia:", error)
      toast.error("No se pudo registrar la asistencia")
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

  const handleEdit = (entry: BitacoraEntry) => {
    setEditingEntry(entry)
    setIsEditDialogOpen(true)
  }

  const handleUpdateEntry = async (updatedEntry: BitacoraEntry) => {
    try {
      // Actualizar en Firebase
      await updateEntry(updatedEntry)

      // Actualizar el estado local
      const updatedEntries = entries.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry))

      setEntries(updatedEntries)
      setFilteredEntries((prevFiltered) =>
        prevFiltered.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry)),
      )

      setIsEditDialogOpen(false)
      setEditingEntry(null)
      toast.success("Registro actualizado correctamente")
    } catch (error) {
      console.error("Error al actualizar entrada:", error)
      toast.error("No se pudo actualizar el registro")
    }
  }

  // Verificar si una tarea está vencida (fecha de entrega pasada y no completada)
  const isOverdue = (entry: BitacoraEntry) => {
    return !entry.completada && new Date(entry.fechaEntrega) < new Date()
  }

  const handleFilter = async (responsable: string | null, estado: string | null, vencidas: boolean) => {
    try {
      setLoading(true)

      if (!responsable && !estado && !vencidas) {
        // Si no hay filtros, mostrar todas las entradas
        setFilteredEntries(entries)
      } else {
        // Filtrar localmente si ya tenemos los datos
        if (entries.length > 0) {
          let filtered = [...entries]

          if (responsable) {
            filtered = filtered.filter((entry) => entry.responsable === responsable)
          }

          if (estado) {
            filtered = filtered.filter((entry) => (estado === "completada" ? entry.completada : !entry.completada))
          }

          if (vencidas) {
            filtered = filtered.filter(isOverdue)
          }

          setFilteredEntries(filtered)
        } else {
          // O consultar a Firebase si es necesario
          const filtered = await getFilteredEntries(responsable, estado)
          // Aplicar filtro de vencidas localmente
          setFilteredEntries(vencidas ? filtered.filter(isOverdue) : filtered)
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
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-6 px-2 flex flex-col min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-center">Sistema de Gestión</h1>

        <Tabs
          defaultValue="form"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full flex-grow flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="form">Nuevo Registro</TabsTrigger>
            <TabsTrigger value="entries">Ver Registros</TabsTrigger>
            <TabsTrigger value="stats">Estadísticas</TabsTrigger>
            <TabsTrigger value="asistencia">Asistencia</TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="flex-grow">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Nuevo Registro en Bitácora</CardTitle>
                <CardDescription>Complete el formulario para añadir un nuevo registro a la bitácora.</CardDescription>
              </CardHeader>
              <CardContent>
                <BitacoraForm onSubmit={addEntry} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="entries" className="flex-grow">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Registros de la Bitácora</CardTitle>
                <CardDescription>Visualice y filtre los registros guardados en la bitácora.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                <BitacoraFilter responsables={responsables} onFilter={handleFilter} />

                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="flex-grow">
                    <BitacoraTable
                      entries={filteredEntries}
                      onToggleComplete={handleToggleComplete}
                      onEdit={handleEdit}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="flex-grow">
            <Card className="h-full">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <BitacoraStats entries={entries} />
              )}
            </Card>
          </TabsContent>

          <TabsContent value="asistencia" className="flex-grow">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              <Card>
                <CardHeader>
                  <CardTitle>Registrar Asistencia</CardTitle>
                  <CardDescription>Registre la asistencia seleccionando el nombre, fecha y hora.</CardDescription>
                </CardHeader>
                <CardContent>
                  <AsistenciaForm onSubmit={addAsistenciaEntry} />
                </CardContent>
              </Card>

              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Registros de Asistencia</CardTitle>
                  <CardDescription>Historial de asistencias registradas.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  {loadingAsistencias ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <AsistenciaTable entries={asistencias} />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Diálogo de edición */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Editar Registro</DialogTitle>
            </DialogHeader>
            {editingEntry && <BitacoraForm onSubmit={handleUpdateEntry} initialData={editingEntry} isEditing={true} />}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
