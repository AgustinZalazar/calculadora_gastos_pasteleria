export interface Ingredient {
  id: string
  name: string
  baseUnit: string // Unidad en la que se compró (ej: kg)
  usedUnit: string // Unidad usada en la receta (ej: g)
  pricePerUnit: number // Precio por unidad base
  quantity: number // Cantidad en la unidad usada
}

// Unidades compatibles para conversión
export type WeightUnit = "kg" | "g" | "mg" | "lb" | "oz"
export type VolumeUnit = "l" | "ml" | "gal"
export type CountUnit = "unidad" | "docena"

export const UNIT_GROUPS = {
  weight: ["kg", "g", "mg", "lb", "oz"],
  volume: ["l", "ml", "gal"],
  count: ["unidad", "docena"],
} as const

// Factores de conversión a la unidad base (kg para peso, l para volumen, unidad para conteo)
export const CONVERSION_FACTORS: Record<string, number> = {
  // Peso (base: kg)
  kg: 1,
  g: 0.001,
  mg: 0.000001,
  lb: 0.453592,
  oz: 0.0283495,
  // Volumen (base: l)
  l: 1,
  ml: 0.001,
  gal: 3.78541,
  // Conteo (base: unidad)
  unidad: 1,
  docena: 12,
}

export interface RawMaterial {
  id: string
  name: string
  unit: string
  pricePerUnit: number
  purchaseDate: string // YYYY-MM-DD
}

export interface SaleFormat {
  id: string
  name: string // ej: "Individual", "Bandeja x12", "Caja x6"
  quantity: number // Cantidad de unidades en este formato
  profitMargin: number // Margen de ganancia para este formato
}

export interface Recipe {
  id: string
  name: string
  ingredients: Ingredient[]
  yield: number
  yieldUnit: string
  profitMargin: number // Margen por defecto
  saleFormats: SaleFormat[] // Formatos de venta
}

export interface CostSummary {
  totalCost: number
  costPerUnit: number
  suggestedPrice: number
  profit: number
}
