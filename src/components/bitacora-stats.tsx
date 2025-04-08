"use client"

import { useMemo, useState, useEffect } from "react"
import { format, startOfWeek } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { toast } from "sonner"
import type { BitacoraEntry } from "../types/bitacora"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import BitacoraTable from "../components/bitacora-table"
import { getEntriesByTimeFilter } from "../firebase/bitacora-service"

interface BitacoraStatsProps {
  entries: BitacoraEntry[]
}

type TimeFilter = "all" | "day" | "week" | "month"

export default function BitacoraStats({ entries: initialEntries }: BitacoraStatsProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all")
  const [entries, setEntries] = useState<BitacoraEntry[]>(initialEntries)
  const [loading, setLoading] = useState(false)
  const [showTable, setShowTable] = useState(false)

  // Cargar entradas filtradas desde Firebase cuando cambie el filtro
  useEffect(() => {
    const fetchFilteredEntries = async () => {
      try {
        setLoading(true)
        const data = await getEntriesByTimeFilter(timeFilter)
        setEntries(data)
      } catch (error) {
        console.error("Error al cargar entradas filtradas:", error)
        toast.error("No se pudieron cargar los datos filtrados")
      } finally {
        setLoading(false)
      }
    }

    fetchFilteredEntries()
  }, [timeFilter])

  const responsableStats = useMemo(() => {
    const stats = new Map<string, { total: number; completadas: number }>()

    entries.forEach((entry) => {
      if (!stats.has(entry.responsable)) {
        stats.set(entry.responsable, { total: 0, completadas: 0 })
      }

      const currentStats = stats.get(entry.responsable)!
      currentStats.total += 1

      if (entry.completada) {
        currentStats.completadas += 1
      }

      stats.set(entry.responsable, currentStats)
    })

    return Array.from(stats.entries())
      .map(([name, data]) => ({
        name,
        total: data.total,
        completadas: data.completadas,
        pendientes: data.total - data.completadas,
      }))
      .sort((a, b) => b.total - a.total)
  }, [entries])

  const categoriaStats = useMemo(() => {
    const stats = new Map<string, number>()

    entries.forEach((entry) => {
      const categoria = entry.categoria
      stats.set(categoria, (stats.get(categoria) || 0) + 1)
    })

    return Array.from(stats.entries())
      .map(([name, value]) => {
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

        return {
          name: labels[name as keyof typeof labels] || name,
          value,
        }
      })
      .sort((a, b) => b.value - a.value)
  }, [entries])

  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case "day":
        return `Hoy (${format(new Date(), "dd/MM/yyyy")})`
      case "week":
        return `Esta semana (${format(startOfWeek(new Date(), { weekStartsOn: 1 }), "dd/MM/yyyy", { locale: es })} - ${format(new Date(), "dd/MM/yyyy", { locale: es })})`
      case "month":
        return `Este mes (${format(new Date(), "MMMM yyyy", { locale: es })})`
      default:
        return "Todos los tiempos"
    }
  }

  if (entries.length === 0 && !loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas</CardTitle>
          <CardDescription>No hay datos suficientes para mostrar estadísticas.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Tareas por Responsable</CardTitle>
          <CardDescription>
            Conteo detallado de tareas totales, completadas y pendientes por cada responsable
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Estadísticas actualizadas al {format(new Date(), "dd/MM/yyyy HH:mm")}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Responsable</TableHead>
                <TableHead className="text-center">Total Tareas</TableHead>
                <TableHead className="text-center">Completadas</TableHead>
                <TableHead className="text-center">Pendientes</TableHead>
                <TableHead className="text-center">% Completado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {responsableStats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No hay datos para mostrar
                  </TableCell>
                </TableRow>
              ) : (
                responsableStats.map((stat) => (
                  <TableRow key={stat.name}>
                    <TableCell className="font-medium">{stat.name}</TableCell>
                    <TableCell className="text-center">{stat.total}</TableCell>
                    <TableCell className="text-center text-green-600 font-medium">{stat.completadas}</TableCell>
                    <TableCell className="text-center text-red-600 font-medium">{stat.pendientes}</TableCell>
                    <TableCell className="text-center">
                      {stat.total > 0 ? `${Math.round((stat.completadas / stat.total) * 100)}%` : "0%"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Tareas por Responsable</CardTitle>
            <CardDescription>
              {getTimeFilterLabel()}: Distribución de tareas completadas y pendientes por cada responsable
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={timeFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeFilter("all")}
            >
              Todos
            </Button>
            <Button
              variant={timeFilter === "day" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeFilter("day")}
            >
              Día
            </Button>
            <Button
              variant={timeFilter === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeFilter("week")}
            >
              Semana
            </Button>
            <Button
              variant={timeFilter === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeFilter("month")}
            >
              Mes
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {responsableStats.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No hay datos para el período seleccionado</div>
          ) : (
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={responsableStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completadas" stackId="a" fill="#4ade80" name="Completadas" />
                  <Bar dataKey="pendientes" stackId="a" fill="#f87171" name="Pendientes" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribución por Categoría</CardTitle>
          <CardDescription>{getTimeFilterLabel()}: Número de tareas por cada categoría</CardDescription>
        </CardHeader>
        <CardContent>
          {categoriaStats.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No hay datos para el período seleccionado</div>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoriaStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#60a5fa" name="Cantidad" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Listado de Tareas</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowTable(!showTable)}>
            {showTable ? "Ocultar listado" : "Mostrar listado"}
          </Button>
        </CardHeader>
        {showTable && (
          <CardContent>
            <BitacoraTable entries={entries} />
          </CardContent>
        )}
      </Card>
    </div>
  )
}


