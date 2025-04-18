"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Search, X } from "lucide-react"

interface BitacoraFilterProps {
  responsables: string[]
  onFilter: (responsable: string | null, estado: string | null, vencidas: boolean) => void
}

export default function BitacoraFilter({ responsables, onFilter }: BitacoraFilterProps) {
  const [responsable, setResponsable] = useState<string | null>(null)
  const [estado, setEstado] = useState<string | null>(null)
  const [vencidas, setVencidas] = useState<boolean>(false)

  const handleFilter = () => {
    onFilter(responsable, estado, vencidas)
  }

  const handleClear = () => {
    setResponsable(null)
    setEstado(null)
    setVencidas(false)
    onFilter(null, null, false)
  }

  return (
    <Card className="p-4 mb-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">Responsable</label>
          <Select value={responsable || ""} onValueChange={(value) => setResponsable(value || null)}>
            <SelectTrigger>
              <SelectValue placeholder="Todos los responsables" />
            </SelectTrigger>
            <SelectContent>
              {responsables && responsables.length > 0 ? (
                responsables.map((resp) => (
                  <SelectItem key={resp} value={resp}>
                    {resp}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="" disabled>
                  No hay responsables disponibles
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">Estado</label>
          <Select value={estado || ""} onValueChange={(value) => setEstado(value || null)}>
            <SelectTrigger>
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="completada">Completada</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">Vencidas</label>
          <div className="flex items-center h-10 mt-1">
            <input
              type="checkbox"
              id="vencidas"
              checked={vencidas}
              onChange={(e) => setVencidas(e.target.checked)}
              className="h-4 w-4 mr-2"
            />
            <label htmlFor="vencidas" className="text-sm">
              Mostrar solo tareas vencidas
            </label>
          </div>
        </div>

        <div className="flex items-end gap-2">
          <Button onClick={handleFilter} className="flex-1 md:flex-none">
            <Search className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
          <Button variant="outline" onClick={handleClear} className="flex-1 md:flex-none">
            <X className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
        </div>
      </div>
    </Card>
  )
}
