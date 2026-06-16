export type Area = "cultura" | "deporte"

export const ACTIVE_AREA_KEY = "bitacoraActiveArea"

export function isValidArea(value: unknown): value is Area {
  return value === "cultura" || value === "deporte"
}

/** Resuelve un área de sesión a cultura o deporte. */
export function resolveArea(
  input: unknown,
  fallback: Area = "cultura",
  preferred?: unknown,
): Area {
  if (isValidArea(input)) return input
  if (isValidArea(preferred)) return preferred
  return fallback
}

/** Prioriza el área de la BD donde se encontró el usuario si el documento no la define. */
export function areaFromSource(sourceArea: Area, docArea: unknown): Area {
  if (isValidArea(docArea)) return docArea
  return sourceArea
}

export function isMultiAreaInput(input: unknown): boolean {
  return input === "all"
}
