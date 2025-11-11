"use client"

import type React from "react"

import { useState } from "react"
import { Search, Sparkles, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface SearchFormProps {
  onSearch: (companyName: string) => void
  isSearching: boolean
}

export function SearchForm({ onSearch, isSearching }: SearchFormProps) {
  const [companyName, setCompanyName] = useState("")
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (companyName.trim()) {
      onSearch(companyName.trim())
    }
  }

  return (
    <Card className="relative p-10 mb-16 bg-gradient-to-br from-card via-card to-primary/5 border-2 border-primary/20 shadow-2xl hover:shadow-3xl hover:border-primary/40 transition-all duration-300 overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-accent/10 to-transparent rounded-full blur-3xl -z-0" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-3xl -z-0" />

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="flex flex-col md:flex-row gap-5">
          <div className="flex-1 relative group">
            <Search
              className={`absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 transition-all duration-300 ${
                isFocused ? "text-primary scale-110" : "text-muted-foreground"
              }`}
            />

            <Input
              type="text"
              placeholder="Ex: Gertech Soluções (buscaremos: Gertech Infocell, Gertech Digital...)"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`h-16 pl-14 pr-5 text-lg font-medium bg-background/80 backdrop-blur-sm border-2 transition-all duration-300 ${
                isFocused
                  ? "border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                  : "border-border/50 hover:border-primary/30"
              }`}
              disabled={isSearching}
            />

            {isFocused && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent animate-gradient" />
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isSearching || !companyName.trim()}
            className="h-16 px-10 text-lg font-bold bg-gradient-to-r from-primary via-secondary to-accent hover:shadow-2xl hover:shadow-primary/30 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 border-2 border-primary/30"
          >
            {isSearching ? (
              <>
                <Sparkles className="w-6 h-6 mr-3 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Zap className="w-6 h-6 mr-3" />
                Buscar Empresas
              </>
            )}
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 text-base text-muted-foreground">
          <Sparkles className="w-4 h-4 text-accent" />
          <p className="font-medium">
            Encontramos empresas que usam o <span className="text-primary font-bold">mesmo nome</span> do seu cliente em{" "}
            <span className="text-accent font-bold">segundos</span>
          </p>
        </div>
      </form>
    </Card>
  )
}
