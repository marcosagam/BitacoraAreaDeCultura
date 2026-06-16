"use client"

import { useAuth } from "../contexts/AuthContext"
import type { Area } from "../types/auth"
import { Button } from "./ui/button"

const AREA_LABELS: Record<Area, string> = {
  cultura: "Cultura",
  deporte: "Deporte",
}

export default function AreaSwitcher() {
  const { area, multiArea, setActiveArea } = useAuth()

  if (!multiArea) {
    return (
      <span className="text-sm font-medium text-gray-600 px-2 py-1 rounded-md bg-gray-100">
        {AREA_LABELS[area]}
      </span>
    )
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border bg-gray-50 p-1">
      {(["cultura", "deporte"] as const).map((option) => (
        <Button
          key={option}
          type="button"
          size="sm"
          variant={area === option ? "default" : "ghost"}
          className="h-8 px-3"
          onClick={() => setActiveArea(option)}
        >
          {AREA_LABELS[option]}
        </Button>
      ))}
    </div>
  )
}
