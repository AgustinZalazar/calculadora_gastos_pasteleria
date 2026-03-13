"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Trash2, BookOpen, ChevronDown, ChevronUp, Calculator, DollarSign, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useStore } from "@/lib/store"
import type { Recipe, Ingredient, SaleFormat } from "@/lib/types"
import { cn } from "@/lib/utils"
import { calculateIngredientCost, formatUnit } from "@/lib/unit-utils"

function RecipeCard({ recipe, onDelete }: { recipe: Recipe; onDelete: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<SaleFormat | null>(
    recipe.saleFormats?.[0] || null
  )
  const [customQuantity, setCustomQuantity] = useState("1")

  const getIngredientCost = (ing: Ingredient) => {
    return calculateIngredientCost(
      ing.quantity,
      ing.usedUnit,
      ing.pricePerUnit,
      ing.baseUnit
    )
  }

  const totalCost = recipe.ingredients.reduce(
    (total, ing) => total + getIngredientCost(ing),
    0
  )
  const costPerUnit = totalCost / recipe.yield

  // Calcular precios basados en el formato seleccionado
  const getFormatCost = (format: SaleFormat) => costPerUnit * format.quantity
  const getFormatPrice = (format: SaleFormat) => 
    getFormatCost(format) * (1 + format.profitMargin / 100)

  // Precio por defecto (primer formato o individual)
  const defaultFormat = recipe.saleFormats?.[0] || {
    id: "default",
    name: "Individual",
    quantity: 1,
    profitMargin: recipe.profitMargin,
  }
  const displayPrice = getFormatPrice(defaultFormat)

  // Cálculos de venta personalizados
  const quantity = parseFloat(customQuantity) || 0
  const activeFormat = selectedFormat || defaultFormat
  const customFormatCost = getFormatCost(activeFormat) * quantity
  const customFormatPrice = getFormatPrice(activeFormat) * quantity
  const customTotalProfit = customFormatPrice - customFormatCost

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value)
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <div
        className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-serif font-semibold text-lg">{recipe.name}</h3>
            <p className="text-sm text-muted-foreground">
              Rinde: {recipe.yield} {recipe.yieldUnit}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {defaultFormat.name} ({defaultFormat.quantity} {recipe.yieldUnit})
              </p>
              <p className="font-semibold text-primary">
                {formatCurrency(displayPrice)}
              </p>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-border p-4 space-y-4 bg-muted/20">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-background rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Costo Total</p>
              <p className="font-semibold">{formatCurrency(totalCost)}</p>
            </div>
            <div className="p-3 bg-background rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">
                Costo/{recipe.yieldUnit.slice(0, -1) || "unidad"}
              </p>
              <p className="font-semibold">{formatCurrency(costPerUnit)}</p>
            </div>
            <div className="p-3 bg-background rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Margen</p>
              <p className="font-semibold text-accent">{recipe.profitMargin}%</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2">Ingredientes:</h4>
            <div className="space-y-1">
              {recipe.ingredients.map((ing) => (
                <div
                  key={ing.id}
                  className="flex justify-between text-sm py-1.5 px-3 bg-background rounded"
                >
                  <span>
                    {ing.name} - {ing.quantity} {formatUnit(ing.usedUnit)}
                    {ing.usedUnit !== ing.baseUnit && (
                      <span className="text-xs text-muted-foreground ml-1">
                        (de {formatUnit(ing.baseUnit)})
                      </span>
                    )}
                  </span>
                  <span className="text-muted-foreground">
                    {formatCurrency(getIngredientCost(ing))}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Formatos de Venta Disponibles */}
          {recipe.saleFormats && recipe.saleFormats.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Formatos de Venta:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {recipe.saleFormats.map((format) => (
                  <div
                    key={format.id}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-colors",
                      selectedFormat?.id === format.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background hover:border-primary/50"
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFormat(format)
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{format.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format.quantity} {recipe.yieldUnit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary text-sm">
                          {formatCurrency(getFormatPrice(format))}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format.profitMargin}% margen
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Calculadora de Venta</span>
              {selectedFormat && (
                <span className="text-xs text-muted-foreground">
                  - {selectedFormat.name}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Cantidad de {activeFormat.name.toLowerCase()}
                </label>
                <Input
                  type="number"
                  value={customQuantity}
                  onChange={(e) => setCustomQuantity(e.target.value)}
                  min="0"
                  className="bg-background"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="text-center p-2 bg-background rounded-lg">
                <p className="text-xs text-muted-foreground">Costo</p>
                <p className="font-semibold">{formatCurrency(customFormatCost)}</p>
              </div>
              <div className="text-center p-2 bg-background rounded-lg">
                <p className="text-xs text-muted-foreground">Precio Total</p>
                <p className="font-semibold text-primary">
                  {formatCurrency(customFormatPrice)}
                </p>
              </div>
              <div className="text-center p-2 bg-accent/10 rounded-lg">
                <p className="text-xs text-muted-foreground">Ganancia</p>
                <p className={cn(
                  "font-semibold",
                  customTotalProfit >= 0 ? "text-green-600" : "text-destructive"
                )}>
                  {formatCurrency(customTotalProfit)}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {quantity} {activeFormat.name.toLowerCase()} = {quantity * activeFormat.quantity} {recipe.yieldUnit} 
              {recipe.yield && ` (de ${recipe.yield} disponibles)`}
            </p>
          </div>

          <div className="flex justify-end">
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar Receta
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export function RecipesList() {
  const { recipes, deleteRecipe } = useStore()

  const totalRecipes = recipes.length
  const avgMargin =
    totalRecipes > 0
      ? recipes.reduce((sum, r) => sum + r.profitMargin, 0) / totalRecipes
      : 0

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-serif text-lg">
            <BookOpen className="h-5 w-5 text-primary" />
            Mis Recetas
          </div>
          {totalRecipes > 0 && (
            <div className="flex items-center gap-4 text-sm font-normal">
              <span className="text-muted-foreground">
                {totalRecipes} receta{totalRecipes !== 1 ? "s" : ""}
              </span>
              <span className="text-muted-foreground">|</span>
              <span className="flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5 text-accent" />
                <span className="text-accent">
                  Promedio: {avgMargin.toFixed(0)}% margen
                </span>
              </span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recipes.length > 0 ? (
          <div className="space-y-3">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onDelete={async () => {
                  await deleteRecipe(recipe.id)
                  toast.success(`Receta "${recipe.name}" eliminada`)
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>No hay recetas guardadas</p>
            <p className="text-sm">Crea tu primera receta arriba</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
