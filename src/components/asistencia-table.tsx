"use client"

import { format } from "date-fns"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import { useState } from "react"
import { Button } from "../components/ui/button"
import { ChevronLeft, ChevronRight, LogIn, LogOut } from "lucide-react"
import type { AsistenciaEntry } from "../types/asistencia"

interface AsistenciaTableProps {
  entries: AsistenciaEntry[]
}

export default function AsistenciaTable({ entries }: AsistenciaTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15
  const totalPages = Math.ceil(entries.length / itemsPerPage)

  // Obtener entradas para la página actual
  const getCurrentEntries = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return entries.slice(startIndex, endIndex)
  }

  const getTipoBadge = (tipo: "entrada" | "salida") => {
    if (tipo === "entrada") {
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          <LogIn className="h-3 w-3 mr-1" />
          Entrada
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-red-500 hover:bg-red-600">
          <LogOut className="h-3 w-3 mr-1" />
          Salida
        </Badge>
      )
    }
  }

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <Table>
          <TableCaption>Lista de registros de asistencia</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Nombre</TableHead>
              <TableHead className="w-[90px]">Fecha</TableHead>
              <TableHead className="w-[70px]">Hora</TableHead>
              <TableHead className="w-[90px]">Tipo</TableHead>
              <TableHead className="w-[80px]">Distancia</TableHead>
              <TableHead className="w-[100px]">Ubicación</TableHead>
              <TableHead className="w-[130px]">Fecha de Registro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getCurrentEntries().length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  No hay registros de asistencia
                </TableCell>
              </TableRow>
            ) : (
              getCurrentEntries().map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.nombre}</TableCell>
                  <TableCell>{format(new Date(entry.fecha), "dd/MM/yyyy")}</TableCell>
                  <TableCell>{entry.hora}</TableCell>
                  <TableCell>{getTipoBadge(entry.tipo)}</TableCell>
                  <TableCell>
                    <span className={(entry.distancia ?? 0) <= 10 ? "text-green-600" : "text-red-600"}>
                      {entry.distancia?.toFixed(1) ?? "0.0"}m
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div>Lat: {entry.latitud?.toFixed(4)}</div>
                    <div>Lng: {entry.longitud?.toFixed(4)}</div>
                  </TableCell>
                  <TableCell>{format(new Date(entry.fechaCreacion), "dd/MM/yyyy HH:mm")}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {entries.length > itemsPerPage && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
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
                  <span className="sr-only">Anterior</span>
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
                  <span className="sr-only">Siguiente</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
