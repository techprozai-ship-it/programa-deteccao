"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { SearchForm } from "@/components/search-form"
import { ResultsList } from "@/components/results-list"
import { Header } from "@/components/header"
import { Search, Shield, Sparkles, Zap, Target } from "lucide-react"

export default function Home() {
  const [results, setResults] = useState<
    Array<{
      name: string
      similarity: number
      cnpj: string
      status: string
      address: string
    }>
  >([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchedName, setSearchedName] = useState("")

  const handleSearch = async (companyName: string) => {
    setResults([])
    setIsSearching(true)
    setSearchedName(companyName)

    try {
      const response = await fetch(`/api/search?companyName=${encodeURIComponent(companyName)}`);
      if (!response.ok) {
        throw new Error(`Erro na busca: ${response.statusText}`);
      }
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Falha ao buscar empresas:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-80 h-80 bg-secondary/15 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "4s" }}
        />
      </div>

      <Header />

      <main className="container mx-auto px-6 py-16 max-w-7xl relative z-10">
        <div className="mb-20 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 border-2 border-primary/30 text-primary text-sm font-bold mb-6 hover:scale-105 transition-transform cursor-default shadow-lg">
            <Sparkles className="w-4 h-4 animate-pulse" />
            Proteção Legal Inteligente
            <Shield className="w-4 h-4" />
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold mb-8 text-balance leading-tight">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient">
              Busca de Empresas
            </span>
            <br />
            <span className="text-foreground">com Mesmo Nome</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed font-medium">
            Identifique empresas que usam o <span className="text-primary font-bold">mesmo nome</span> do seu cliente
            para <span className="text-accent font-bold">notificação extrajudicial</span>
          </p>

          <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-5xl mx-auto">
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-card to-primary/5 border-2 border-primary/20 text-left hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 transition-all duration-300 cursor-default">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-lg">
                <Search className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Busca por Nome Idêntico</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Encontra empresas com o mesmo nome base da sua marca
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-gradient-to-br from-card to-accent/5 border-2 border-accent/20 text-left hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/20 hover:-translate-y-2 transition-all duration-300 cursor-default">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-lg">
                <Target className="w-7 h-7 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Identificação Precisa</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Lista completa de empresas usando sua marca registrada
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-gradient-to-br from-card to-secondary/5 border-2 border-secondary/20 text-left hover:border-secondary/50 hover:shadow-2xl hover:shadow-secondary/20 hover:-translate-y-2 transition-all duration-300 cursor-default">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-lg">
                <Zap className="w-7 h-7 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Documentos Prontos</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Notificações extrajudiciais automatizadas
              </p>
            </div>
          </div>
        </div>

        <SearchForm onSearch={handleSearch} isSearching={isSearching} />

        {isSearching && (
          <div className="flex justify-center items-center mt-8 text-lg text-primary-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Buscando empresas similares...
          </div>
        )}

        {!isSearching && results.length > 0 && <ResultsList results={results} searchedName={searchedName} />}
      </main>
    </div>
  )
}
