"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Plus, X, ChefHat, Sparkles, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useStore } from "@/lib/store"
import type { Ingredient, SaleFormat } from "@/lib/types"
import { getCompatibleUnits, calculateIngredientCost, formatUnit } from "@/lib/unit-utils"

const YIELD_UNITS = [
  { value: "porciones", label: "Porciones" },
  { value: "unidades", label: "Unidades" },
  { value: "rebanadas", label: "Rebanadas" },
  { value: "piezas", label: "Piezas" },
  { value: "kg", label: "Kilogramos" },
]

export function RecipeForm() {
  const { rawMaterials, addRecipe } = useStore()
  const [recipeName, setRecipeName] = useState("")
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [yieldAmount, setYieldAmount] = useState("")
  const [yieldUnit, setYieldUnit] = useState("")
  const [profitMargin, setProfitMargin] = useState("30")

  const [selectedMaterial, setSelectedMaterial] = useState("")
  const [ingredientQuantity, setIngredientQuantity] = useState("")
  const [ingredientUnit, setIngredientUnit] = useState("")

  // Formatos de venta
  const [saleFormats, setSaleFormats] = useState<SaleFormat[]>([])
  const [formatName, setFormatName] = useState("")
  const [formatQuantity, setFormatQuantity] = useState("")
  const [formatMargin, setFormatMargin] = useState("30")

  // Obtener unidades compatibles cuando se selecciona un material
  const selectedMaterialData = rawMaterials.find((m) => m.id === selectedMaterial)
  const compatibleUnits = selectedMaterialData
    ? getCompatibleUnits(selectedMaterialData.unit)
    : []

  const handleAddIngredient = () => {
    if (!selectedMaterial || !ingredientQuantity || !ingredientUnit) return

    const material = rawMaterials.find((m) => m.id === selectedMaterial)
    if (!material) return

    const newIngredient: Ingredient = {
      id: crypto.randomUUID(),
      name: material.name,
      baseUnit: material.unit,
      usedUnit: ingredientUnit,
      pricePerUnit: material.pricePerUnit,
      quantity: parseFloat(ingredientQuantity),
    }

    setIngredients([...ingredients, newIngredient])
    setSelectedMaterial("")
    setIngredientQuantity("")
    setIngredientUnit("")
  }

  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter((i) => i.id !== id))
  }

  const handleAddSaleFormat = () => {
    if (!formatName || !formatQuantity) return

    const newFormat: SaleFormat = {
      id: crypto.randomUUID(),
      name: formatName,
      quantity: parseFloat(formatQuantity),
      profitMargin: parseFloat(formatMargin) || 30,
    }

    setSaleFormats([...saleFormats, newFormat])
    setFormatName("")
    setFormatQuantity("")
    setFormatMargin("30")
  }

  const removeSaleFormat = (id: string) => {
    setSaleFormats(saleFormats.filter((f) => f.id !== id))
  }

  const calculateIngredientCostValue = (ing: Ingredient) => {
    return calculateIngredientCost(
      ing.quantity,
      ing.usedUnit,
      ing.pricePerUnit,
      ing.baseUnit
    )
  }

  const calculateTotalCost = () => {
    return ingredients.reduce(
      (total, ing) => total + calculateIngredientCostValue(ing),
      0
    )
  }

  const calculateCostPerUnit = () => {
    const total = calculateTotalCost()
    const yieldNum = parseFloat(yieldAmount) || 1
    return total / yieldNum
  }

  const calculateSuggestedPrice = () => {
    const costPerUnit = calculateCostPerUnit()
    const margin = parseFloat(profitMargin) || 0
    return costPerUnit * (1 + margin / 100)
  }

  const calculateFormatPrice = (format: SaleFormat) => {
    const costPerUnit = calculateCostPerUnit()
    const formatCost = costPerUnit * format.quantity
    return formatCost * (1 + format.profitMargin / 100)
  }

  const handleSaveRecipe = async () => {
    if (!recipeName || ingredients.length === 0 || !yieldAmount || !yieldUnit)
      return

    const finalFormats = saleFormats.length > 0 ? saleFormats : [{
      id: crypto.randomUUID(),
      name: "Individual",
      quantity: 1,
      profitMargin: parseFloat(profitMargin),
    }]

    await addRecipe({
      id: crypto.randomUUID(),
      name: recipeName,
      ingredients,
      yield: parseFloat(yieldAmount),
      yieldUnit,
      profitMargin: parseFloat(profitMargin),
      saleFormats: finalFormats,
    })

    toast.success(`Receta "${recipeName}" guardada correctamente`)
    setRecipeName("")
    setIngredients([])
    setYieldAmount("")
    setYieldUnit("")
    setProfitMargin("30")
    setSaleFormats([])
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value)
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 font-serif text-lg">
          <ChefHat className="h-5 w-5 text-primary" />
          Nueva Receta
        </CardTitle>
        <CardDescription>
          Crea una receta agregando ingredientes y calculando costos automáticamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Nombre */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Nombre de la receta
          </label>
          <Input
            placeholder="Ej: Alfajores de maicena"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            className="bg-background text-base"
          />
        </div>

        {/* Ingredientes */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-foreground">Ingredientes</h4>
          <div className="p-4 rounded-lg border border-border/60 bg-muted/20 space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Ingrediente
              </label>
              <Select
                value={selectedMaterial}
                onValueChange={(value) => {
                  setSelectedMaterial(value)
                  const material = rawMaterials.find((m) => m.id === value)
                  if (material) setIngredientUnit(material.unit)
                }}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Seleccionar ingrediente..." />
                </SelectTrigger>
                <SelectContent>
                  {rawMaterials.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} — {formatCurrency(m.pricePerUnit)}/{m.unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Cantidad usada
                </label>
                <Input
                  type="number"
                  placeholder="Ej: 250"
                  value={ingredientQuantity}
                  onChange={(e) => setIngredientQuantity(e.target.value)}
                  className="bg-background"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Unidad
                </label>
                <Select
                  value={ingredientUnit}
                  onValueChange={setIngredientUnit}
                  disabled={!selectedMaterial}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {compatibleUnits.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {formatUnit(unit)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide opacity-0 select-none">
                  &nbsp;
                </label>
                <Button
                  onClick={handleAddIngredient}
                  variant="secondary"
                  className="w-full"
                  disabled={!selectedMaterial || !ingredientQuantity || !ingredientUnit}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar ingrediente
                </Button>
              </div>
            </div>

            {rawMaterials.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                Primero agrega materias primas en la sección de arriba
              </p>
            )}
          </div>

          {ingredients.length > 0 && (
            <div className="space-y-2">
              {ingredients.map((ing) => (
                <div
                  key={ing.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{ing.name}</span>
                    <span className="text-muted-foreground ml-2 text-sm">
                      {ing.quantity} {formatUnit(ing.usedUnit)}
                    </span>
                    {ing.usedUnit !== ing.baseUnit && (
                      <span className="text-xs text-muted-foreground ml-1">
                        (comprado en {formatUnit(ing.baseUnit)})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-medium">
                      {formatCurrency(calculateIngredientCostValue(ing))}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeIngredient(ing.id)}
                      className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rendimiento y Margen */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-foreground">Rendimiento y Margen</h4>
          <div className="p-4 rounded-lg border border-border/60 bg-muted/20">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Cantidad que rinde
                </label>
                <Input
                  type="number"
                  placeholder="Ej: 24"
                  value={yieldAmount}
                  onChange={(e) => setYieldAmount(e.target.value)}
                  className="bg-background"
                  min="1"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Unidad
                </label>
                <Select value={yieldUnit} onValueChange={setYieldUnit}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {YIELD_UNITS.map((u) => (
                      <SelectItem key={u.value} value={u.value}>
                        {u.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Margen de ganancia (%)
                  </label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-medium mb-1">¿Qué margen usar?</p>
                        <ul className="text-xs space-y-0.5">
                          <li>• Venta mayorista: 50–80%</li>
                          <li>• Pastelería artesanal: 150–250%</li>
                          <li>• Premium / encargos: 300%+</li>
                        </ul>
                        <p className="text-xs text-muted-foreground mt-1">
                          El 30% es muy bajo para cubrir tu tiempo y gastos fijos.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  type="number"
                  placeholder="Ej: 150"
                  value={profitMargin}
                  onChange={(e) => setProfitMargin(e.target.value)}
                  className="bg-background"
                  min="0"
                  max="500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Formatos de Venta */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-foreground">
            Formatos de Venta
            <span className="text-xs text-muted-foreground font-normal ml-2">
              (opcional)
            </span>
          </h4>
          <div className="p-4 rounded-lg border border-border/60 bg-muted/20 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Nombre del formato
                </label>
                <Input
                  placeholder="Ej: Bandeja x12"
                  value={formatName}
                  onChange={(e) => setFormatName(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Cantidad de unidades
                </label>
                <Input
                  type="number"
                  placeholder="Ej: 12"
                  value={formatQuantity}
                  onChange={(e) => setFormatQuantity(e.target.value)}
                  className="bg-background"
                  min="1"
                />
              </div>
            </div>
            <div className="flex items-end gap-3">
              <div className="space-y-1.5 flex-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Margen para este formato (%)
                </label>
                <Input
                  type="number"
                  placeholder="Ej: 200"
                  value={formatMargin}
                  onChange={(e) => setFormatMargin(e.target.value)}
                  className="bg-background"
                  min="0"
                  max="500"
                />
              </div>
              <Button
                onClick={handleAddSaleFormat}
                variant="secondary"
                className="shrink-0"
                disabled={!formatName || !formatQuantity}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </div>
            {saleFormats.length === 0 && yieldAmount && (
              <p className="text-xs text-muted-foreground italic">
                Si no agregás formatos, se creará uno individual por defecto con el margen establecido.
              </p>
            )}
          </div>

          {saleFormats.length > 0 && (
            <div className="space-y-2">
              {saleFormats.map((format) => {
                const formatCost = calculateCostPerUnit() * format.quantity
                const formatPrice = calculateFormatPrice(format)
                return (
                  <div
                    key={format.id}
                    className="flex flex-wrap items-center justify-between gap-2 p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <span className="font-medium">{format.name}</span>
                      <span className="text-muted-foreground ml-2 text-sm">
                        ({format.quantity} {yieldUnit || "unidades"})
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-muted-foreground">
                        Costo: <span className="text-foreground">{formatCurrency(formatCost)}</span>
                      </span>
                      <span className="text-muted-foreground">
                        Precio: <span className="font-semibold text-primary">{formatCurrency(formatPrice)}</span>
                      </span>
                      <span className="text-xs text-accent">{format.profitMargin}%</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSaleFormat(format.id)}
                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Resumen */}
        {ingredients.length > 0 && yieldAmount && (
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-primary font-medium">
              <Sparkles className="h-4 w-4" />
              Resumen de Costos
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Costo Total</p>
                <p className="text-lg font-semibold">{formatCurrency(calculateTotalCost())}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Costo por {yieldUnit || "unidad"}
                </p>
                <p className="text-lg font-semibold">{formatCurrency(calculateCostPerUnit())}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ganancia</p>
                <p className="text-lg font-semibold text-accent">{profitMargin}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Precio Sugerido</p>
                <p className="text-lg font-semibold text-primary">
                  {formatCurrency(calculateSuggestedPrice())}
                </p>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={handleSaveRecipe}
          className="w-full"
          disabled={!recipeName || ingredients.length === 0 || !yieldAmount || !yieldUnit}
        >
          Guardar Receta
        </Button>
      </CardContent>
    </Card>
  )
}
