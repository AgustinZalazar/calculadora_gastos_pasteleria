"use client"

import { Cake } from "lucide-react"
import Image from "next/image"

export function Header() {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2">
            <Image src="/logo.png" alt="Logo" width={50} height={50} className="text-primary-foreground" />
            {/* <Cake className="h-6 w-6 text-primary-foreground" /> */}
          </div>
          <div>
            <h1 className="font-serif text-xl font-semibold tracking-tight text-foreground">
              Dulce Cálculo
            </h1>
            <p className="text-xs text-muted-foreground">
              Calculadora de Costos para Mimi's
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
