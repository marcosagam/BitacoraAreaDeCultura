"use client"

import { format } from "date-fns"
import { CheckCircle, XCircle } from "lucide-react"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { BitacoraEntry } from "@/types/bitacora"

interface BitacoraTableProps {
  entries: BitacoraEntry[]
  onToggleComplete?: (id: string) => void // Ahora es opcional
}

export default function BitacoraTable({ entries, onToggleComplete }: BitacoraTableProps) {
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

  // Determinar si mostrar la columna de acción
  const showActionColumn = !!onToggleComplete

  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>Lista de registros en la bitácora</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Responsable</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Estado</TableHead>
            {showActionColumn && <TableHead>Acción</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showActionColumn ? 6 : 5} className="text-center py-6 text-muted-foreground">
                No hay registros que coincidan con los filtros aplicados
              </TableCell>
            </TableRow>
          ) : (
            entries.map((entry) => (
              <TableRow key={entry.id} className={entry.completada ? "bg-green-50" : "bg-red-50"}>
                <TableCell>{format(new Date(entry.fecha), "dd/MM/yyyy")}</TableCell>
                <TableCell className="font-medium">{entry.titulo}</TableCell>
                <TableCell>{entry.responsable}</TableCell>
                <TableCell>
                  <Badge className={getCategoryBadge(entry.categoria)}>{getCategoryLabel(entry.categoria)}</Badge>
                </TableCell>
                <TableCell>
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
                {showActionColumn && (
                  <TableCell>
                    <Button
                      variant={entry.completada ? "outline" : "default"}
                      size="sm"
                      onClick={() => onToggleComplete!(entry.id)}
                    >
                      {entry.completada ? "Marcar pendiente" : "Marcar completada"}
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

