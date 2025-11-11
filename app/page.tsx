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

        {/* APOL API Links Section */}
        <div className="mt-24 pt-16 border-t border-border/50 space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              🏛️ APOL Webservices
            </h2>
            <p className="text-muted-foreground">
              Acesso aos endpoints de Marcas, Patentes e Processos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <a
              href="/api/apol/marcas/docs"
              className="p-6 rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition">
                  🏷️
                </div>
                <h3 className="text-lg font-bold">Marcas</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                GET, POST, PUT, DELETE com autenticação Basic Auth
              </p>
              <div className="text-xs text-primary font-mono mt-3 group-hover:underline">
                /api/apol/marcas →
              </div>
            </a>

            <a
              href="/api/apol/marcas/docs"
              className="p-6 rounded-xl border-2 border-secondary/30 bg-gradient-to-br from-secondary/10 to-transparent hover:border-secondary/60 hover:shadow-lg hover:shadow-secondary/20 transition-all duration-300 group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center group-hover:bg-secondary/30 transition">
                  🔬
                </div>
                <h3 className="text-lg font-bold">Patentes (Em breve)</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Gerenciamento de patentes e inovações registradas
              </p>
              <div className="text-xs text-secondary font-mono mt-3 group-hover:underline">
                /api/apol/patentes →
              </div>
            </a>

            <a
              href="/api/apol/marcas/docs"
              className="p-6 rounded-xl border-2 border-accent/30 bg-gradient-to-br from-accent/10 to-transparent hover:border-accent/60 hover:shadow-lg hover:shadow-accent/20 transition-all duration-300 group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition">
                  ⚖️
                </div>
                <h3 className="text-lg font-bold">Providências (Em breve)</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Gerenciamento de ações judiciais e providências
              </p>
              <div className="text-xs text-accent font-mono mt-3 group-hover:underline">
                /api/apol/providencias →
              </div>
            </a>
          </div>

          <div className="p-6 rounded-xl bg-secondary/5 border-2 border-secondary/20 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              <strong>Autenticação:</strong> Basic Auth (admin:apol2024)
            </p>
            <a
              href="/api/apol/marcas/docs"
              className="inline-block px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-medium hover:shadow-lg transition"
            >
              Ver Documentação Completa
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
