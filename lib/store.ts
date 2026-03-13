"use client"

import { create } from "zustand"
import { supabase, isSupabaseConfigured } from "./supabase"
import type { RawMaterial, Recipe } from "./types"

interface StoreState {
  rawMaterials: RawMaterial[]
  recipes: Recipe[]
  isLoading: boolean
  loadData: () => Promise<void>
  addRawMaterial: (material: RawMaterial) => Promise<void>
  updateRawMaterial: (id: string, material: Partial<RawMaterial>) => Promise<void>
  deleteRawMaterial: (id: string) => Promise<void>
  addRecipe: (recipe: Recipe) => Promise<void>
  updateRecipe: (id: string, recipe: Partial<Recipe>) => Promise<void>
  deleteRecipe: (id: string) => Promise<void>
}

export const useStore = create<StoreState>((set) => ({
  rawMaterials: [],
  recipes: [],
  isLoading: false,

  loadData: async () => {
    if (!isSupabaseConfigured) return
    set({ isLoading: true })
    const [{ data: materials }, { data: recipes }] = await Promise.all([
      supabase.from("raw_materials").select("*").order("created_at"),
      supabase.from("recipes").select("*").order("created_at"),
    ])
    set({
      rawMaterials: (materials ?? []).map((m) => ({
        id: m.id,
        name: m.name,
        unit: m.unit,
        pricePerUnit: m.price_per_unit,
        purchaseDate: m.purchase_date ?? new Date().toISOString().split("T")[0],
      })),
      recipes: (recipes ?? []).map((r) => ({
        id: r.id,
        name: r.name,
        yield: r.yield,
        yieldUnit: r.yield_unit,
        profitMargin: r.profit_margin,
        ingredients: r.ingredients ?? [],
        saleFormats: r.sale_formats ?? [],
      })),
      isLoading: false,
    })
  },

  addRawMaterial: async (material) => {
    if (!isSupabaseConfigured) {
      set((state) => ({ rawMaterials: [...state.rawMaterials, material] }))
      return
    }
    const { error } = await supabase.from("raw_materials").insert({
      id: material.id,
      name: material.name,
      unit: material.unit,
      price_per_unit: material.pricePerUnit,
      purchase_date: material.purchaseDate,
    })
    if (error) {
      console.error("[supabase] addRawMaterial:", error.message)
      return
    }
    set((state) => ({ rawMaterials: [...state.rawMaterials, material] }))
  },

  updateRawMaterial: async (id, material) => {
    if (!isSupabaseConfigured) {
      set((state) => ({
        rawMaterials: state.rawMaterials.map((m) => m.id === id ? { ...m, ...material } : m),
      }))
      return
    }
    const update: Record<string, unknown> = {}
    if (material.name !== undefined) update.name = material.name
    if (material.unit !== undefined) update.unit = material.unit
    if (material.pricePerUnit !== undefined) update.price_per_unit = material.pricePerUnit
    if (material.purchaseDate !== undefined) update.purchase_date = material.purchaseDate

    const { error } = await supabase.from("raw_materials").update(update).eq("id", id)
    if (!error) {
      set((state) => ({
        rawMaterials: state.rawMaterials.map((m) => m.id === id ? { ...m, ...material } : m),
      }))
    }
  },

  deleteRawMaterial: async (id) => {
    if (!isSupabaseConfigured) {
      set((state) => ({ rawMaterials: state.rawMaterials.filter((m) => m.id !== id) }))
      return
    }
    const { error } = await supabase.from("raw_materials").delete().eq("id", id)
    if (!error) {
      set((state) => ({ rawMaterials: state.rawMaterials.filter((m) => m.id !== id) }))
    }
  },

  addRecipe: async (recipe) => {
    if (!isSupabaseConfigured) {
      set((state) => ({ recipes: [...state.recipes, recipe] }))
      return
    }
    const { error } = await supabase.from("recipes").insert({
      id: recipe.id,
      name: recipe.name,
      yield: recipe.yield,
      yield_unit: recipe.yieldUnit,
      profit_margin: recipe.profitMargin,
      ingredients: recipe.ingredients,
      sale_formats: recipe.saleFormats,
    })
    if (error) {
      console.error("[supabase] addRecipe:", error.message)
      return
    }
    set((state) => ({ recipes: [...state.recipes, recipe] }))
  },

  updateRecipe: async (id, recipe) => {
    if (!isSupabaseConfigured) {
      set((state) => ({
        recipes: state.recipes.map((r) => r.id === id ? { ...r, ...recipe } : r),
      }))
      return
    }
    const update: Record<string, unknown> = {}
    if (recipe.name !== undefined) update.name = recipe.name
    if (recipe.yield !== undefined) update.yield = recipe.yield
    if (recipe.yieldUnit !== undefined) update.yield_unit = recipe.yieldUnit
    if (recipe.profitMargin !== undefined) update.profit_margin = recipe.profitMargin
    if (recipe.ingredients !== undefined) update.ingredients = recipe.ingredients
    if (recipe.saleFormats !== undefined) update.sale_formats = recipe.saleFormats

    const { error } = await supabase.from("recipes").update(update).eq("id", id)
    if (!error) {
      set((state) => ({
        recipes: state.recipes.map((r) => r.id === id ? { ...r, ...recipe } : r),
      }))
    }
  },

  deleteRecipe: async (id) => {
    if (!isSupabaseConfigured) {
      set((state) => ({ recipes: state.recipes.filter((r) => r.id !== id) }))
      return
    }
    const { error } = await supabase.from("recipes").delete().eq("id", id)
    if (!error) {
      set((state) => ({ recipes: state.recipes.filter((r) => r.id !== id) }))
    }
  },
}))
