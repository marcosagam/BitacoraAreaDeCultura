"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { toast } from "sonner"
import { useAuth } from "../contexts/AuthContext"
import AppHeader from "../components/app-header"
import BitacoraForm from "../components/bitacora-form"
import BitacoraTable from "../components/bitacora-table"
import BitacoraStats from "../components/bitacora-stats"
import BitacoraFilter from "../components/bitacora-filter"
import AsistenciaForm from "../components/asistencia-form"
import AsistenciaStats from "../components/asistencia-stats"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog"
import type { BitacoraEntry } from "../types/bitacora"
import type { AsistenciaEntry } from "../types/asistencia"
import {
  getAllEntries,
  addEntry as addEntryToFirebase,
  toggleEntryComplete,
  updateEntryEstado,
  getFilteredEntries,
  getUniqueResponsables,
  updateEntry,
  deleteEntry,
} from "../firebase/bitacora-service"
import { getAllAsistencias, addAsistencia } from "../firebase/asistencia-service"

export default function BitacoraPage() {
  const { role, area } = useAuth()
  const isDeporte = area === "deporte"

  const [entries, setEntries] = useState<BitacoraEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<BitacoraEntry[]>([])
  const [asistencias, setAsistencias] = useState<AsistenciaEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingAsistencias, setLoadingAsistencias] = useState(true)
  const [responsables, setResponsables] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState(role === "guest" ? "entries" : "form")
  const [editingEntry, setEditingEntry] = useState<BitacoraEntry | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<string>("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [data, uniqueResponsables] = await Promise.all([
          getAllEntries(area),
          getUniqueResponsables(area),
        ])
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
  }, [area])

  // Solo cargar asistencias para cultura
  useEffect(() => {
    if (isDeporte) return
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
  }, [isDeporte])

  const addEntry = async (entry: Omit<BitacoraEntry, "id">) => {
    try {
      const id = await addEntryToFirebase(entry, area)
      const newEntry = { ...entry, id } as BitacoraEntry
      setEntries((prev) => [newEntry, ...prev])
      setFilteredEntries((prev) => [newEntry, ...prev])
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
      setAsistencias((prev) => [{ ...entry, id } as AsistenciaEntry, ...prev])
      toast.success("Asistencia registrada correctamente")
    } catch (error) {
      console.error("Error al registrar asistencia:", error)
      toast.error("No se pudo registrar la asistencia")
    }
  }

  const handleToggleComplete = async (id: string) => {
    try {
      const entry = entries.find((e) => e.id === id)
      if (!entry) return
      await toggleEntryComplete(id, !entry.completada, area)
      const update = (list: BitacoraEntry[]) =>
        list.map((e) => (e.id === id ? { ...e, completada: !e.completada } : e))
      setEntries(update)
      setFilteredEntries(update)
    } catch (error) {
      console.error("Error al actualizar entrada:", error)
      toast.error("No se pudo actualizar el estado de la tarea")
    }
  }

  const handleChangeEstado = async (id: string, estado: string) => {
    try {
      await updateEntryEstado(id, estado, area)
      const update = (list: BitacoraEntry[]) =>
        list.map((e) => (e.id === id ? { ...e, estado } : e))
      setEntries(update)
      setFilteredEntries(update)
    } catch (error) {
      console.error("Error al actualizar estado:", error)
      toast.error("No se pudo actualizar el estado")
    }
  }

  const handleEdit = (entry: BitacoraEntry) => {
    setEditingEntry(entry)
    setIsEditDialogOpen(true)
  }

  const handleUpdateEntry = async (updatedEntry: BitacoraEntry) => {
    try {
      await updateEntry(updatedEntry, area)
      const update = (list: BitacoraEntry[]) =>
        list.map((e) => (e.id === updatedEntry.id ? updatedEntry : e))
      setEntries(update)
      setFilteredEntries(update)
      setIsEditDialogOpen(false)
      setEditingEntry(null)
      toast.success("Registro actualizado correctamente")
    } catch (error) {
      console.error("Error al actualizar entrada:", error)
      toast.error("No se pudo actualizar el registro")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteEntry(id, area)
      setEntries((prev) => prev.filter((e) => e.id !== id))
      setFilteredEntries((prev) => prev.filter((e) => e.id !== id))
      toast.success("Registro eliminado correctamente")
    } catch (error) {
      console.error("Error al eliminar entrada:", error)
      toast.error("No se pudo eliminar el registro")
    }
  }

  const isOverdue = (entry: BitacoraEntry) =>
    !entry.completada && new Date(entry.fechaEntrega) < new Date()

  const handleFilter = async (responsable: string | null, estado: string | null, vencidas: boolean) => {
    try {
      setLoading(true)
      if (!responsable && !estado && !vencidas) {
        setFilteredEntries(entries)
      } else {
        let filtered = [...entries]
        if (responsable) filtered = filtered.filter((e) => e.responsable === responsable)
        if (estado) {
          if (isDeporte) {
            filtered = filtered.filter((e) => e.estado === estado)
          } else {
            filtered = filtered.filter((e) => (estado === "completada" ? e.completada : !e.completada))
          }
        }
        if (vencidas) filtered = filtered.filter(isOverdue)
        setFilteredEntries(filtered)
      }
    } catch (error) {
      console.error("Error al filtrar entradas:", error)
      toast.error("No se pudieron filtrar los registros")
    } finally {
      setLoading(false)
    }
  }

  // Número de columnas del TabsList
  const tabCols = role === "guest"
    ? (isDeporte ? 1 : 2)
    : (isDeporte ? 3 : 4)

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-white">
        <div className="container mx-auto py-6 px-2 flex flex-col min-h-screen">
          <Tabs
            defaultValue={role === "guest" ? "entries" : "form"}
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full flex-grow flex flex-col"
          >
            <TabsList className={`grid w-full grid-cols-${tabCols}`}>
              {role !== "guest" && <TabsTrigger value="form">Nuevo Registro</TabsTrigger>}
              <TabsTrigger value="entries">Ver Registros</TabsTrigger>
              {role !== "guest" && <TabsTrigger value="stats">Estadísticas</TabsTrigger>}
              {!isDeporte && <TabsTrigger value="asistencia">Asistencia</TabsTrigger>}
            </TabsList>

            {role !== "guest" && (
              <TabsContent value="form" className="flex-grow">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Nuevo Registro en Bitácora</CardTitle>
                    <CardDescription>Complete el formulario para añadir un nuevo registro.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BitacoraForm onSubmit={addEntry} area={area} />
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            <TabsContent value="entries" className="flex-grow">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>Registros de la Bitácora</CardTitle>
                  <CardDescription>Visualice y filtre los registros guardados.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col">
                  <BitacoraFilter
                    responsables={responsables}
                    onFilter={handleFilter}
                    area={area}
                  />
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                    </div>
                  ) : (
                    <div className="flex-grow">
                      <BitacoraTable
                        entries={filteredEntries}
                        onToggleComplete={role !== "guest" && !isDeporte ? handleToggleComplete : undefined}
                        onChangeEstado={role !== "guest" && isDeporte ? handleChangeEstado : undefined}
                        onEdit={role !== "guest" ? handleEdit : undefined}
                        onDelete={role !== "guest" ? handleDelete : undefined}
                        isGuest={role === "guest"}
                        area={area}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {role !== "guest" && (
              <TabsContent value="stats" className="flex-grow">
                <Card className="h-full">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                    </div>
                  ) : (
                    <BitacoraStats entries={entries} />
                  )}
                </Card>
              </TabsContent>
            )}

            {!isDeporte && (
              <TabsContent value="asistencia" className="flex-grow">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                  <Card>
                    <CardHeader>
                      <CardTitle>Registrar Asistencia</CardTitle>
                      <CardDescription>Registre la asistencia seleccionando el nombre, fecha y hora.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AsistenciaForm
                        onSubmit={addAsistenciaEntry}
                        onNameChange={(name) => setSelectedPerson(name)}
                      />
                    </CardContent>
                  </Card>
                  <Card className="flex flex-col">
                    <CardHeader>
                      <CardTitle>Estadísticas de Asistencia</CardTitle>
                      <CardDescription>Consulte las horas trabajadas por monitor.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-auto">
                      {loadingAsistencias ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                        </div>
                      ) : (
                        <AsistenciaStats entries={asistencias} selectedPerson={selectedPerson} />
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            )}
          </Tabs>

          {role !== "guest" && (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Editar Registro</DialogTitle>
                </DialogHeader>
                {editingEntry && (
                  <BitacoraForm
                    onSubmit={handleUpdateEntry}
                    initialData={editingEntry}
                    isEditing={true}
                    area={area}
                  />
                )}
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </>
  )
}
