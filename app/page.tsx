"use client"

import { useEffect } from "react"
import { Header } from "@/components/header"
import { RawMaterialsPanel } from "@/components/raw-materials-panel"
import { RecipeForm } from "@/components/recipe-form"
import { RecipesList } from "@/components/recipes-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, ChefHat, BookOpen } from "lucide-react"
import { useStore } from "@/lib/store"

export default function Home() {
  const loadData = useStore((s) => s.loadData)

  useEffect(() => {
    loadData()
  }, [loadData])
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground tracking-tight text-balance">
              Calcula el costo exacto de tus creaciones
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
              Agrega tus ingredientes, crea recetas y obtén automáticamente el precio de venta ideal para maximizar tus ganancias
            </p>
          </div>

          {/* Mobile Tabs */}
          <div className="block sm:hidden">
            <Tabs defaultValue="materials" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="materials" className="flex items-center gap-1.5 text-xs">
                  <Package className="h-3.5 w-3.5" />
                  <span className="hidden min-[400px]:inline">Materias</span>
                </TabsTrigger>
                <TabsTrigger value="recipe" className="flex items-center gap-1.5 text-xs">
                  <ChefHat className="h-3.5 w-3.5" />
                  <span className="hidden min-[400px]:inline">Receta</span>
                </TabsTrigger>
                <TabsTrigger value="recipes" className="flex items-center gap-1.5 text-xs">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span className="hidden min-[400px]:inline">Recetas</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="materials">
                <RawMaterialsPanel />
              </TabsContent>
              <TabsContent value="recipe">
                <RecipeForm />
              </TabsContent>
              <TabsContent value="recipes">
                <RecipesList />
              </TabsContent>
            </Tabs>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:block space-y-6">
            <RawMaterialsPanel />
            <RecipeForm />
            <RecipesList />
          </div>
        </div>
      </main>

      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Dulce Cálculo - Hecho con cariño para pasteleros y panaderos
          </p>
        </div>
      </footer>
    </div>
  )
}
