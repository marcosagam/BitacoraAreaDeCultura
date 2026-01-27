"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import { AlertTriangle, Clock, Calendar, Target } from "lucide-react"
import type { AsistenciaEntry } from "../types/asistencia"
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  differenceInMinutes,
  format,
  getWeeksInMonth,
} from "date-fns"
import { es } from "date-fns/locale"

interface AsistenciaStatsProps {
  entries: AsistenciaEntry[]
  selectedPerson?: string
}

const RESPONSABLES = [
  "ALEJANDRO GOMEZ COBO",
  "ANGIE NATALIA SANTANA ROJAS",
  "ASHLY CAICEDO",
  "DIANA MARULANDA",
  "EDUARD LUBO URBANO",
  "EDWIN PORTELA",
  "FRANCISCO EMERSON CASTAÑEDA RAMIREZ",
  "ISABELA OBREGON",
  "IVAN FERNANDO VASQUEZ MANCILLA",
  "JUAN DAVID TABARES",
  "JUAN PABLO CRUZ",
  "KERELYN GRUTIERREZ VENECIA",
  "LUIS SANTIAGO AZA JARAMILLO",
  "MARCOS AMILKAR MURILLO AGAMEZ",
  "SANTIAGO FERNANDO NACED ROJAS",
]

const WEEKLY_HOURS_TARGET = 20

export default function AsistenciaStats({ entries, selectedPerson }: AsistenciaStatsProps) {
  // Debug: Ver qué datos están llegando
  console.log("AsistenciaStats - entries:", entries)
  console.log("AsistenciaStats - selectedPerson:", selectedPerson)
  console.log("AsistenciaStats - entries length:", entries.length)
  // Obtener el emoji basado en las horas trabajadas
  const getProgressEmoji = (hours: number) => {
    const percentage = (hours / WEEKLY_HOURS_TARGET) * 100
    if (percentage >= 100) return "🎉"
    if (percentage >= 80) return "😄"
    if (percentage >= 60) return "😊"
    if (percentage >= 40) return "😐"
    if (percentage >= 20) return "😟"
    return "😴"
  }

  // Obtener el color de la barra de progreso basado en el porcentaje
  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-green-500"
    if (percentage >= 80) return "bg-emerald-500"
    if (percentage >= 60) return "bg-yellow-500"
    if (percentage >= 40) return "bg-orange-500"
    if (percentage >= 20) return "bg-red-400"
    return "bg-red-600"
  }

  // Calcular las horas trabajadas a partir de las entradas y salidas
  const calculateHours = (personEntries: AsistenciaEntry[]) => {
    console.log("calculateHours - personEntries:", personEntries)
    
    // Agrupar entradas por fecha
    const entriesByDate: Record<string, AsistenciaEntry[]> = {}

    for (const entry of personEntries) {
      // Convertir fecha a string para usar como clave
      const dateKey = entry.fecha.toISOString().split('T')[0];
      console.log("Processing entry:", entry, "dateKey:", dateKey)

      if (!entriesByDate[dateKey]) {
        entriesByDate[dateKey] = []
      }
      entriesByDate[dateKey].push(entry)
    }

    console.log("entriesByDate:", entriesByDate)

    let totalMinutes = 0

    // Para cada fecha, emparejar entradas con salidas
    for (const dateKey in entriesByDate) {
      const dayEntries = entriesByDate[dateKey].sort((a, b) => {
        return a.hora.localeCompare(b.hora)
      })

      console.log("Processing day:", dateKey, "entries:", dayEntries)

      let entradaTime: string | null = null

      for (const entry of dayEntries) {
        if (entry.tipo === "entrada") {
          entradaTime = entry.hora
          console.log("Found entrada at:", entradaTime)
        } else if (entry.tipo === "salida" && entradaTime) {
          // Calcular diferencia entre entrada y salida
          const [entradaHour, entradaMin] = entradaTime.split(":").map(Number)
          const [salidaHour, salidaMin] = entry.hora.split(":").map(Number)
          
          const entradaMinutes = entradaHour * 60 + entradaMin
          const salidaMinutes = salidaHour * 60 + salidaMin
          
          const diff = salidaMinutes - entradaMinutes
          
          console.log("Calculating hours:", {
            entrada: entradaTime,
            salida: entry.hora,
            entradaMinutes,
            salidaMinutes,
            diff,
            diffHours: diff / 60
          })
          
          if (diff > 0) {
            totalMinutes += diff
          }
          
          entradaTime = null
        }
      }
    }

    const totalHours = totalMinutes / 60
    console.log("Total calculated hours:", totalHours)
    return totalHours // Retornar en horas
  }

  // Filtrar entradas por persona y rango de fechas
  const getEntriesInRange = (name: string, startDate: Date, endDate: Date) => {
    console.log("getEntriesInRange called with:", { name, startDate, endDate })
    
    const filtered = entries.filter((entry) => {
      // entry.fecha ya es un objeto Date, no necesitamos convertirlo
      const entryDate = new Date(entry.fecha)
      const nameMatch = entry.nombre === name
      const dateMatch = isWithinInterval(entryDate, { start: startDate, end: endDate })
      
      console.log("Filtering entry:", {
        entryName: entry.nombre,
        targetName: name,
        nameMatch,
        entryDate,
        dateMatch,
        included: nameMatch && dateMatch
      })
      
      return nameMatch && dateMatch
    })
    
    console.log("Filtered entries:", filtered)
    return filtered
  }

  // Calcular estadísticas para todos los monitores
  const allStats = useMemo(() => {
    const now = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    
    // Calcular semanas en el mes para las horas mensuales requeridas
    const weeksInMonth = getWeeksInMonth(now, { weekStartsOn: 1 })
    const monthlyHoursTarget = WEEKLY_HOURS_TARGET * weeksInMonth

    return RESPONSABLES.map((nombre) => {
      const weeklyEntries = getEntriesInRange(nombre, weekStart, weekEnd)
      const monthlyEntries = getEntriesInRange(nombre, monthStart, monthEnd)

      const weeklyHours = calculateHours(weeklyEntries)
      const monthlyHours = calculateHours(monthlyEntries)

      const weeklyPercentage = Math.min((weeklyHours / WEEKLY_HOURS_TARGET) * 100, 100)
      const horasFaltantesMes = Math.max(monthlyHoursTarget - monthlyHours, 0)

      return {
        nombre,
        weeklyHours,
        monthlyHours,
        weeklyPercentage,
        isUnderTarget: weeklyHours < WEEKLY_HOURS_TARGET,
        horasFaltantesMes,
        monthlyHoursTarget,
      }
    })
  }, [entries])

  // Estadísticas de la persona seleccionada
  const selectedStats = useMemo(() => {
    if (!selectedPerson) return null

    const now = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    const weeksInMonth = getWeeksInMonth(now, { weekStartsOn: 1 })
    const monthlyHoursTarget = WEEKLY_HOURS_TARGET * weeksInMonth

    const weeklyEntries = getEntriesInRange(selectedPerson, weekStart, weekEnd)
    const monthlyEntries = getEntriesInRange(selectedPerson, monthStart, monthEnd)

    const weeklyHours = calculateHours(weeklyEntries)
    const monthlyHours = calculateHours(monthlyEntries)

    const weeklyPercentage = Math.min((weeklyHours / WEEKLY_HOURS_TARGET) * 100, 100)
    const horasFaltantesMes = Math.max(monthlyHoursTarget - monthlyHours, 0)

    return {
      weeklyHours,
      monthlyHours,
      weeklyPercentage,
      isUnderTarget: weeklyHours < WEEKLY_HOURS_TARGET,
      weekStart,
      weekEnd,
      monthStart,
      horasFaltantesMes,
      monthlyHoursTarget,
    }
  }, [selectedPerson, entries])

  return (
    <div className="space-y-4">
      {/* Resumen de la persona que llena el formulario */}
      {selectedPerson && selectedStats && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Tu Resumen: {selectedPerson.split(" ")[0]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Alerta si no cumple las 20 horas */}
            {selectedStats.isUnderTarget && (
              <Alert variant="destructive" className="mb-4 border-red-500 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="font-bold">Ojo, no esta trabajando -_-</AlertTitle>
                <AlertDescription>
                  Te faltan {(WEEKLY_HOURS_TARGET - selectedStats.weeklyHours).toFixed(1)} horas esta semana.
                </AlertDescription>
              </Alert>
            )}

            {/* Barra de progreso semanal */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progreso Semanal</span>
                <span className="text-2xl">{getProgressEmoji(selectedStats.weeklyHours)}</span>
              </div>
              <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ease-out ${getProgressColor(selectedStats.weeklyPercentage)}`}
                  style={{ width: `${selectedStats.weeklyPercentage}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white drop-shadow-md">
                    {selectedStats.weeklyHours.toFixed(1)}h / {WEEKLY_HOURS_TARGET}h ({selectedStats.weeklyPercentage.toFixed(0)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Estadisticas en grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <p className="text-xl font-bold text-blue-600">{selectedStats.weeklyHours.toFixed(1)}h</p>
                <p className="text-xs text-gray-600">Esta semana</p>
              </div>
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <p className="text-xl font-bold text-green-600">{selectedStats.monthlyHours.toFixed(1)}h</p>
                <p className="text-xs text-gray-600">Este mes</p>
              </div>
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <p className="text-xl font-bold text-orange-600">{selectedStats.horasFaltantesMes.toFixed(1)}h</p>
                <p className="text-xs text-gray-600">Faltan (mes)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de todos los monitores */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Estadisticas de Todos los Monitores
          </CardTitle>
          <p className="text-xs text-gray-500">
            Meta semanal: {WEEKLY_HOURS_TARGET}h | Meta mensual: {allStats[0]?.monthlyHoursTarget || 80}h ({format(new Date(), "MMMM yyyy", { locale: es })})
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-bold text-xs">Monitor</TableHead>
                  <TableHead className="font-bold text-xs text-center">Progreso Semanal</TableHead>
                  <TableHead className="font-bold text-xs text-center w-20">Semana</TableHead>
                  <TableHead className="font-bold text-xs text-center w-20">Mes</TableHead>
                  <TableHead className="font-bold text-xs text-center w-20">Faltan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allStats.map((stat) => (
                  <TableRow 
                    key={stat.nombre} 
                    className={`${stat.isUnderTarget ? "bg-red-50" : "bg-green-50"} ${selectedPerson === stat.nombre ? "ring-2 ring-blue-500" : ""}`}
                  >
                    <TableCell className="font-medium text-xs py-2">
                      <div className="flex items-center gap-1">
                        <span className="text-lg">{getProgressEmoji(stat.weeklyHours)}</span>
                        <span className="truncate max-w-[120px]" title={stat.nombre}>
                          {stat.nombre.split(" ").slice(0, 2).join(" ")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${getProgressColor(stat.weeklyPercentage)}`}
                          style={{ width: `${stat.weeklyPercentage}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-white drop-shadow-md">
                            {stat.weeklyPercentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center py-2">
                      <span className={`text-xs font-bold ${stat.weeklyHours >= WEEKLY_HOURS_TARGET ? "text-green-600" : "text-red-600"}`}>
                        {stat.weeklyHours.toFixed(1)}h
                      </span>
                    </TableCell>
                    <TableCell className="text-center py-2">
                      <span className="text-xs font-bold text-blue-600">
                        {stat.monthlyHours.toFixed(1)}h
                      </span>
                    </TableCell>
                    <TableCell className="text-center py-2">
                      <span className={`text-xs font-bold ${stat.horasFaltantesMes > 0 ? "text-orange-600" : "text-green-600"}`}>
                        {stat.horasFaltantesMes.toFixed(1)}h
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Mensaje si no hay persona seleccionada */}
      {!selectedPerson && (
        <Alert className="border-blue-200 bg-blue-50">
          <Calendar className="h-4 w-4" />
          <AlertTitle>Selecciona tu nombre</AlertTitle>
          <AlertDescription>
            Selecciona tu nombre en el formulario de asistencia para ver tu resumen personal.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
