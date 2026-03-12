"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CheckCircle, XCircle, Edit, ChevronLeft, ChevronRight, Trash2 } from "lucide-react"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog"
import type { BitacoraEntry } from "../types/bitacora"

interface BitacoraTableProps {
  entries: BitacoraEntry[]
  onToggleComplete?: (id: string) => void
  onEdit?: (entry: BitacoraEntry) => void
  onDelete?: (id: string) => void
  isGuest?: boolean
}

export default function BitacoraTable({ entries, onToggleComplete, onEdit, onDelete, isGuest = false }: BitacoraTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedEntry, setSelectedEntry] = useState<BitacoraEntry | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const itemsPerPage = 13
  const totalPages = Math.ceil(entries.length / itemsPerPage)

  const getCurrentEntries = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return entries.slice(startIndex, endIndex)
  }

  const getCategoryBadge = (category: string) => {
    const styles: Record<string, string> = {
      capacitacion: "bg-blue-500 hover:bg-blue-600",
      convocatoria: "bg-purple-500 hover:bg-purple-600",
      correo_electronico: "bg-teal-500 hover:bg-teal-600",
      estadistica_participacion: "bg-indigo-500 hover:bg-indigo-600",
      eventos: "bg-yellow-500 hover:bg-yellow-600",
      formulario: "bg-pink-500 hover:bg-pink-600",
      informe: "bg-orange-500 hover:bg-orange-600",
      ofimatica: "bg-cyan-500 hover:bg-cyan-600",
      participacion: "bg-emerald-500 hover:bg-emerald-600",
      prestamo: "bg-violet-500 hover:bg-violet-600",
      prestamo_equipos_sonido: "bg-fuchsia-500 hover:bg-fuchsia-600",
      propuesta: "bg-amber-500 hover:bg-amber-600",
      publicacion_redes: "bg-lime-500 hover:bg-lime-600",
      reunion: "bg-green-500 hover:bg-green-600",
      solicitud: "bg-rose-500 hover:bg-rose-600",
      tareas_bodega: "bg-sky-500 hover:bg-sky-600",
      tareas_oficina: "bg-slate-500 hover:bg-slate-600",
      uniformes: "bg-red-500 hover:bg-red-600",
    }
    return styles[category] || "bg-gray-500 hover:bg-gray-600"
  }

  const getCategoryLabel = (category: string) => {
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
    return labels[category] || category
  }

  const isOverdue = (entry: BitacoraEntry) => {
    return !entry.completada && new Date(entry.fechaEntrega) < new Date()
  }

  const handleDelete = () => {
    if (deleteId && onDelete) {
      onDelete(deleteId)
      setDeleteId(null)
    }
  }

  // Vista móvil (tarjetas)
  const MobileView = () => (
    <div className="space-y-4 md:hidden">
      {getCurrentEntries().map((entry) => (
        <div
          key={entry.id}
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
            isOverdue(entry)
              ? "bg-red-50 border-red-300"
              : entry.completada
                ? "bg-green-50 border-green-300"
                : "bg-yellow-50 border-yellow-300"
          }`}
          onClick={() => isGuest && setSelectedEntry(entry)}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg flex-1">{entry.titulo}</h3>
            {!isGuest && (
              <div className="flex items-center gap-1">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(entry)
                    }}
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {onToggleComplete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleComplete(entry.id)
                    }}
                    title={entry.completada ? "Marcar pendiente" : "Marcar completada"}
                  >
                    {entry.completada ? (
                      <XCircle className="h-4 w-4 text-orange-600" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteId(entry.id)
                    }}
                    title="Eliminar"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Fecha:</span>
              <span className="font-medium">{format(new Date(entry.fecha), "dd/MM/yyyy")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Entrega:</span>
              <span className="font-medium">{format(new Date(entry.fechaEntrega), "dd/MM/yyyy")}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Responsable:</span>
              <span className="font-medium text-right">{entry.responsable}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Categoría:</span>
              <Badge className={getCategoryBadge(entry.categoria)}>{getCategoryLabel(entry.categoria)}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Estado:</span>
              {entry.completada ? (
                <span className="flex items-center text-green-600 font-medium">
                  <CheckCircle className="mr-1 h-4 w-4" /> Completada
                </span>
              ) : (
                <span className="flex items-center text-red-600 font-medium">
                  <XCircle className="mr-1 h-4 w-4" /> Pendiente
                </span>
              )}
            </div>
            {isOverdue(entry) && (
              <Badge variant="destructive" className="w-full justify-center">
                VENCIDA
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  )

  // Vista desktop (tabla)
  const DesktopView = () => (
    <div className="hidden md:block rounded-md border">
      <div className="overflow-x-auto">
        <Table>
          <TableCaption>Lista de registros en la bitácora</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Fecha</TableHead>
              <TableHead className="w-[100px]">Entrega</TableHead>
              <TableHead className="w-[250px]">Título</TableHead>
              <TableHead className="w-[180px]">Responsable</TableHead>
              <TableHead className="w-[150px]">Categoría</TableHead>
              <TableHead className="w-[120px]">Estado</TableHead>
              {!isGuest && <TableHead className="w-[200px]">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {getCurrentEntries().length === 0 ? (
              <TableRow>
                <TableCell colSpan={isGuest ? 6 : 7} className="text-center py-6 text-muted-foreground">
                  No hay registros que coincidan con los filtros aplicados
                </TableCell>
              </TableRow>
            ) : (
              getCurrentEntries().map((entry) => (
                <TableRow
                  key={entry.id}
                  className={`${isOverdue(entry) ? "bg-red-100" : entry.completada ? "bg-green-50" : "bg-yellow-50"} ${isGuest ? "cursor-pointer hover:bg-opacity-80" : ""}`}
                  onClick={() => isGuest && setSelectedEntry(entry)}
                >
                  <TableCell className="whitespace-nowrap">{format(new Date(entry.fecha), "dd/MM/yyyy")}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(entry.fechaEntrega), "dd/MM/yyyy")}
                    {isOverdue(entry) && (
                      <Badge variant="destructive" className="ml-2">
                        Vencida
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium truncate max-w-[250px]" title={entry.titulo}>
                      {entry.titulo}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 truncate max-w-[250px]" title={entry.descripcion}>
                      {entry.descripcion}
                    </div>
                  </TableCell>
                  <TableCell className="truncate max-w-[180px]" title={entry.responsable}>
                    {entry.responsable}
                  </TableCell>
                  <TableCell>
                    <Badge className={getCategoryBadge(entry.categoria)}>{getCategoryLabel(entry.categoria)}</Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {entry.completada ? (
                      <span className="flex items-center text-green-600">
                        <CheckCircle className="mr-1 h-4 w-4" /> Completada
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600">
                        <XCircle className="mr-1 h-4 w-4" /> Pendiente
                      </span>
                    )}
                  </TableCell>
                  {!isGuest && (
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              onEdit(entry)
                            }}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onToggleComplete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              onToggleComplete(entry.id)
                            }}
                            title={entry.completada ? "Marcar pendiente" : "Marcar completada"}
                          >
                            {entry.completada ? (
                              <XCircle className="h-4 w-4 text-orange-600" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteId(entry.id)
                            }}
                            title="Eliminar"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )

  return (
    <>
      <MobileView />
      <DesktopView />

      {/* Paginación */}
      {entries.length > itemsPerPage && (
        <div className="flex items-center justify-between px-4 py-3 border-t mt-4">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a{" "}
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, entries.length)}</span> de{" "}
                <span className="font-medium">{entries.length}</span> resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-l-md"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page
                  if (totalPages <= 5) {
                    page = i + 1
                  } else if (currentPage <= 3) {
                    page = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i
                  } else {
                    page = currentPage - 2 + i
                  }
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  )
                })}
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-r-md"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo de detalles para guest (móvil) */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedEntry?.titulo}</DialogTitle>
            <DialogDescription>Detalles completos del registro</DialogDescription>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div>
                <span className="font-semibold">Descripción:</span>
                <p className="text-sm text-gray-700 mt-1">{selectedEntry.descripcion}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold text-sm">Fecha del evento:</span>
                  <p className="text-sm">{format(new Date(selectedEntry.fecha), "dd/MM/yyyy")}</p>
                </div>
                <div>
                  <span className="font-semibold text-sm">Fecha de entrega:</span>
                  <p className="text-sm">{format(new Date(selectedEntry.fechaEntrega), "dd/MM/yyyy")}</p>
                </div>
              </div>
              <div>
                <span className="font-semibold text-sm">Responsable:</span>
                <p className="text-sm">{selectedEntry.responsable}</p>
              </div>
              <div>
                <span className="font-semibold text-sm">Categoría:</span>
                <div className="mt-1">
                  <Badge className={getCategoryBadge(selectedEntry.categoria)}>
                    {getCategoryLabel(selectedEntry.categoria)}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="font-semibold text-sm">Estado:</span>
                <div className="mt-1">
                  {selectedEntry.completada ? (
                    <span className="flex items-center text-green-600">
                      <CheckCircle className="mr-1 h-4 w-4" /> Completada
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600">
                      <XCircle className="mr-1 h-4 w-4" /> Pendiente
                    </span>
                  )}
                </div>
              </div>
              <div>
                <span className="font-semibold text-sm">Fecha de creación:</span>
                <p className="text-sm">{format(new Date(selectedEntry.fechaCreacion), "dd/MM/yyyy HH:mm")}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El registro será eliminado permanentemente.
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
    </>
  )
}
