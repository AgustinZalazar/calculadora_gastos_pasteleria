import { UNIT_GROUPS, CONVERSION_FACTORS } from "./types"

/**
 * Obtiene el grupo de unidades al que pertenece una unidad
 */
export function getUnitGroup(unit: string): string | null {
  for (const [group, units] of Object.entries(UNIT_GROUPS)) {
    if (units.includes(unit as never)) {
      return group
    }
  }
  return null
}

/**
 * Obtiene las unidades compatibles para una unidad dada
 */
export function getCompatibleUnits(unit: string): string[] {
  const group = getUnitGroup(unit)
  if (!group) return [unit]
  return UNIT_GROUPS[group as keyof typeof UNIT_GROUPS] as unknown as string[]
}

/**
 * Convierte una cantidad de una unidad a otra
 * @returns La cantidad convertida, o null si las unidades no son compatibles
 */
export function convertUnits(
  quantity: number,
  fromUnit: string,
  toUnit: string
): number | null {
  const fromGroup = getUnitGroup(fromUnit)
  const toGroup = getUnitGroup(toUnit)

  // Si las unidades no están en ningún grupo conocido o no son del mismo grupo
  if (!fromGroup || !toGroup || fromGroup !== toGroup) {
    // Si son la misma unidad, retornar la cantidad tal cual
    if (fromUnit === toUnit) return quantity
    return null
  }

  // Convertir: primero a unidad base, luego a unidad destino
  const fromFactor = CONVERSION_FACTORS[fromUnit]
  const toFactor = CONVERSION_FACTORS[toUnit]

  if (fromFactor === undefined || toFactor === undefined) {
    return null
  }

  // cantidad * (factor de origen) / (factor de destino)
  return (quantity * fromFactor) / toFactor
}

/**
 * Calcula el costo de un ingrediente considerando la conversión de unidades
 * @param quantity Cantidad usada en la receta
 * @param usedUnit Unidad usada en la receta
 * @param pricePerUnit Precio por unidad base
 * @param baseUnit Unidad en la que se compró
 */
export function calculateIngredientCost(
  quantity: number,
  usedUnit: string,
  pricePerUnit: number,
  baseUnit: string
): number {
  // Convertir la cantidad usada a la unidad base
  const convertedQuantity = convertUnits(quantity, usedUnit, baseUnit)
  
  console.log("[v0] calculateIngredientCost:", {
    quantity,
    usedUnit,
    pricePerUnit,
    baseUnit,
    convertedQuantity,
    result: convertedQuantity !== null ? convertedQuantity * pricePerUnit : quantity * pricePerUnit
  })
  
  if (convertedQuantity === null) {
    // Si no se puede convertir, asumir que es la misma unidad
    return quantity * pricePerUnit
  }

  return convertedQuantity * pricePerUnit
}

/**
 * Formatea la unidad para mostrar de forma más legible
 */
export function formatUnit(unit: string): string {
  const labels: Record<string, string> = {
    kg: "kg",
    g: "g",
    mg: "mg",
    lb: "lb",
    oz: "oz",
    l: "L",
    ml: "ml",
    gal: "gal",
    unidad: "unidad",
    docena: "docena",
  }
  return labels[unit] || unit
}
