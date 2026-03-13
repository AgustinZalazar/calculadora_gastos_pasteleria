"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Plus, Trash2, Package, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useStore } from "@/lib/store"
import type { RawMaterial } from "@/lib/types"

const UNITS = [
  { value: "kg", label: "Kilogramo (kg)" },
  { value: "g", label: "Gramo (g)" },
  { value: "l", label: "Litro (l)" },
  { value: "ml", label: "Mililitro (ml)" },
  { value: "unidad", label: "Unidad" },
  { value: "docena", label: "Docena" },
]

const today = () => new Date().toISOString().split("T")[0]

function calcPricePerUnit(quantity: string, totalPrice: string): number | null {
  const q = parseFloat(quantity)
  const p = parseFloat(totalPrice)
  if (!q || !p || q <= 0) return null
  return p / q
}

export function RawMaterialsPanel() {
  const { rawMaterials, addRawMaterial, updateRawMaterial, deleteRawMaterial } = useStore()

  // Add form
  const [name, setName] = useState("")
  const [unit, setUnit] = useState("")
  const [quantity, setQuantity] = useState("")
  const [totalPrice, setTotalPrice] = useState("")
  const [purchaseDate, setPurchaseDate] = useState(today())

  // Edit dialog
  const [editing, setEditing] = useState<RawMaterial | null>(null)
  const [editName, setEditName] = useState("")
  const [editUnit, setEditUnit] = useState("")
  const [editQuantity, setEditQuantity] = useState("")
  const [editTotalPrice, setEditTotalPrice] = useState("")
  const [editDate, setEditDate] = useState("")

  const pricePerUnit = calcPricePerUnit(quantity, totalPrice)
  const editPricePerUnit = calcPricePerUnit(editQuantity, editTotalPrice)

  const handleAdd = async () => {
    if (!name || !unit || !quantity || !totalPrice || pricePerUnit === null) return
    await addRawMaterial({
      id: crypto.randomUUID(),
      name,
      unit,
      pricePerUnit,
      purchaseDate,
    })
    setName("")
    setUnit("")
    setQuantity("")
    setTotalPrice("")
    setPurchaseDate(today())
    toast.success(`${name} agregado correctamente`)
  }

  const openEdit = (material: RawMaterial) => {
    setEditing(material)
    setEditName(material.name)
    setEditUnit(material.unit)
    setEditQuantity("")
    setEditTotalPrice("")
    setEditDate(material.purchaseDate)
  }

  const handleSaveEdit = async () => {
    if (!editing || !editName || !editUnit || !editDate) return
    const newPricePerUnit = editPricePerUnit ?? editing.pricePerUnit
    await updateRawMaterial(editing.id, {
      name: editName,
      unit: editUnit,
      pricePerUnit: newPricePerUnit,
      purchaseDate: editDate,
    })
    toast.success(`${editName} actualizado correctamente`)
    setEditing(null)
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value)

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-")
    return `${d}/${m}/${y}`
  }

  return (
    <>
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 font-serif text-lg">
            <Package className="h-5 w-5 text-primary" />
            Materias Primas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg border border-border/60 bg-muted/20 space-y-3">
            {/* Fila 1: Nombre + Fecha */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ingrediente</label>
                <Input
                  placeholder="Ej: Harina 000"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Fecha de compra</label>
                <Input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="bg-background"
                />
              </div>
            </div>
            {/* Fila 2: Cantidad + Unidad + Precio */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cantidad comprada</label>
                <Input
                  type="number"
                  placeholder="Ej: 1000"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="bg-background"
                  min="0"
                  step="0.001"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Unidad</label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => (
                      <SelectItem key={u.value} value={u.value}>
                        {u.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Precio total pagado</label>
                <Input
                  type="number"
                  placeholder="Ej: $2500"
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(e.target.value)}
                  className="bg-background"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            {/* Preview + Botón */}
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm min-h-5">
                {pricePerUnit !== null && unit ? (
                  <span className="text-muted-foreground">
                    Precio calculado: <span className="font-semibold text-foreground">{formatCurrency(pricePerUnit)} / {unit}</span>
                  </span>
                ) : (
                  <span className="text-muted-foreground/50 text-xs">Completá cantidad y precio para ver el costo por unidad</span>
                )}
              </div>
              <Button
                onClick={handleAdd}
                disabled={!name || !unit || !quantity || !totalPrice || pricePerUnit === null}
                className="shrink-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </div>
          </div>

          {rawMaterials.length > 0 ? (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Ingrediente</TableHead>
                    <TableHead>Unidad</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead>Fecha compra</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rawMaterials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium">{material.name}</TableCell>
                      <TableCell>{material.unit}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(material.pricePerUnit)} / {material.unit}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {material.purchaseDate ? formatDate(material.purchaseDate) : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(material)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={async () => {
                              await deleteRawMaterial(material.id)
                              toast.success(`${material.name} eliminado`)
                            }}
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No hay materias primas registradas</p>
              <p className="text-sm">Agrega ingredientes para comenzar</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar {editing?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Nombre</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Unidad</label>
              <Select value={editUnit} onValueChange={setEditUnit}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u.value} value={u.value}>
                      {u.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Cantidad comprada</label>
                <Input
                  type="number"
                  placeholder={`Dejar vacío para mantener precio actual`}
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                  className="bg-background"
                  min="0"
                  step="0.001"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Precio total pagado</label>
                <div className="space-y-1">
                  <Input
                    type="number"
                    placeholder="Nuevo precio"
                    value={editTotalPrice}
                    onChange={(e) => setEditTotalPrice(e.target.value)}
                    className="bg-background"
                    min="0"
                    step="0.01"
                  />
                  {editPricePerUnit !== null && editUnit && (
                    <p className="text-xs text-muted-foreground">
                      = {formatCurrency(editPricePerUnit)} / {editUnit}
                    </p>
                  )}
                  {!editPricePerUnit && editing && (
                    <p className="text-xs text-muted-foreground">
                      Precio actual: {formatCurrency(editing.pricePerUnit)} / {editing.unit}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Fecha de compra</label>
              <Input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="bg-background"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={!editName || !editUnit || !editDate}>
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
