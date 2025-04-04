"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"

interface BitacoraFilterProps {
  responsables: string[]
  categorias: Record<string, string>
  onFilter: (responsable: string | null, categoria: string | null) => void
}

export default function BitacoraFilter({ responsables, categorias, onFilter }: BitacoraFilterProps) {
  const [responsable, setResponsable] = useState<string | null>(null)
  const [categoria, setCategoria] = useState<string | null>(null)

  const handleFilter = () => {
    onFilter(responsable, categoria)
  }

  const handleClear = () => {
    setResponsable(null)
    setCategoria(null)
    onFilter(null, null)
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
              {responsables.map((resp) => (
                <SelectItem key={resp} value={resp}>
                  {resp}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">Categoría</label>
          <Select value={categoria || ""} onValueChange={(value) => setCategoria(value || null)}>
            <SelectTrigger>
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categorias).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

