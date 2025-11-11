"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Building2, MapPin, CheckCircle2, AlertTriangle, Sparkles, Globe, Link } from "lucide-react"
import { NotificationModal } from "@/components/notification-modal"

interface Result {
  name: string
  similarity: number
  match_type?: 'exact' | 'similar' | 'approximate' | string | null
  cnpj?: string | null
  status?: string | null
  address?: string | null
  website?: string | null
  instagram?: string | null
  verified?: boolean
  company_number?: string | null
  jurisdiction?: string | null
}

interface ResultsListProps {
  results: Result[]
  searchedName: string
}

export function ResultsList({ results, searchedName }: ResultsListProps) {
  const [selectedCompany, setSelectedCompany] = useState<Result | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  const highlightMatch = (text: string, query?: string | null) => {
    if (!query) return <>{text}</>
    const tokens = query
      .split(/\s+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .map(escapeRegExp)
    if (tokens.length === 0) return <>{text}</>
    const re = new RegExp(`(${tokens.join('|')})`, 'gi')
    const parts = text.split(re)
    return (
      <>
        {parts.map((part, i) => {
          if (part.match(re)) {
            return (
              <mark key={i} className="bg-yellow-200 text-foreground px-0.5 rounded">
                {part}
              </mark>
            )
          }
          return <span key={i}>{part}</span>
        })}
      </>
    )
  }

  const getRiskColor = () => {
    return "bg-gradient-to-r from-destructive/20 to-destructive/10 text-destructive border-destructive/30"
  }

  return (
    <>
      <div className="space-y-10">
        <div className="flex items-center justify-between p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-2 border-primary/20">
            <div>
              <h2 className="text-4xl font-extrabold mb-3 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Empresas similares
              </h2>
              <p className="text-lg text-muted-foreground font-medium">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  Resultados para: <span className="text-primary font-bold ml-2">{searchedName}</span>
                </span>
                <span className="block mt-2">
                  Encontramos <span className="text-primary font-bold">{results.length}</span> {results.length === 1 ? "empresa" : "empresas"} relacionadas
                </span>
              </p>
            </div>
          <Badge className="text-lg px-6 py-3 font-bold bg-gradient-to-r from-primary to-secondary text-primary-foreground border-2 border-primary/30 shadow-lg">
            {results.length} {results.length === 1 ? "Resultado" : "Resultados"}
          </Badge>
        </div>

        <div className="grid gap-8">
          {results.map((result, index) => (
            <Card
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`relative p-8 transition-all duration-500 bg-gradient-to-br from-card via-card to-primary/5 border-2 overflow-hidden ${
                hoveredIndex === index
                  ? "border-primary/50 shadow-2xl shadow-primary/20 scale-[1.02] -translate-y-1"
                  : "border-border/30 shadow-lg hover:border-primary/30"
              }`}
            >
              {hoveredIndex === index && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-gradient -z-0" />
              )}

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                <div className="flex-1 space-y-5">
                  <div className="flex items-start gap-5">
                    <div className="relative shrink-0">
                      <div
                        className={`absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-2xl blur-md transition-opacity duration-300 ${
                          hoveredIndex === index ? "opacity-60" : "opacity-30"
                        }`}
                      ></div>
                      <div
                        className={`relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20 transition-all duration-300 ${
                          hoveredIndex === index ? "scale-110 rotate-6 border-primary/40" : ""
                        }`}
                      >
                        <Building2 className="w-8 h-8 text-primary" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-2xl font-extrabold mb-3 break-words transition-all duration-300 ${
                          hoveredIndex === index
                            ? "bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"
                            : "text-foreground"
                        }`}
                      >
                        {highlightMatch(result.name, searchedName)}
                      </h3>

                      <div className="flex items-center gap-3 mb-3">
                        {result.verified ? (
                          <Badge className="px-3 py-1 bg-green-600 text-white font-bold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Verificado
                          </Badge>
                        ) : (
                          <Badge className="px-3 py-1">Não verificado</Badge>
                        )}

                        {result.verified && result.company_number && result.jurisdiction && (
                          <a
                            href={`https://opencorporates.com/companies/${result.jurisdiction}/${result.company_number}`}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <Link className="w-4 h-4" />
                            Fonte
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="px-3 py-1 font-bold">
                          {typeof result.similarity === 'number' ? `${Math.round(result.similarity)}%` : '—'}
                        </Badge>
                        <Badge className="px-3 py-1">
                          {(result.match_type ?? 'unknown').toString()}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-base text-muted-foreground font-medium">
                        {result.cnpj ? (
                          <span className="font-mono font-bold text-foreground">{result.cnpj}</span>
                        ) : (
                          <span className="text-muted-foreground">CNPJ não disponível</span>
                        )}
                        <span className="text-border">•</span>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-accent" />
                          <span>{result.address ?? 'Endereço não disponível'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-4">
                    {result.website && (
                      <a
                        href={result.website}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-2 text-sm text-primary-foreground hover:underline"
                      >
                        <Globe className="w-4 h-4" />
                        Site
                      </a>
                    )}

                    {result.instagram && (
                      <a
                        href={result.instagram.startsWith('http') ? result.instagram : `https://instagram.com/${result.instagram.replace(/^@/, '')}`}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-2 text-sm text-pink-600 hover:underline"
                      >
                        <Link className="w-4 h-4" />
                        Instagram
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <Badge className={`${getRiskColor()} border-2 px-4 py-2 font-bold text-base shadow-lg`}>
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Mesmo Nome - 100%
                      </span>
                    </Badge>
                    <Badge className={`${getRiskColor()} px-4 py-2 font-bold text-base`}>Uso Indevido de Marca</Badge>
                    <Badge
                      className={`flex items-center gap-2 px-4 py-2 font-bold text-base border-2 ${
                        result.status === "Ativa"
                          ? "bg-gradient-to-r from-accent/20 to-accent/10 text-accent border-accent/30"
                          : "bg-gradient-to-r from-muted to-muted/50 text-muted-foreground border-border"
                      }`}
                    >
                      {result.status === "Ativa" ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                      {result.status}
                    </Badge>
                  </div>
                </div>

                <Button
                  onClick={() => setSelectedCompany(result)}
                  size="lg"
                  className="shrink-0 h-14 px-8 text-base font-bold bg-gradient-to-r from-primary via-secondary to-accent hover:shadow-2xl hover:shadow-primary/30 hover:scale-110 transition-all duration-300 border-2 border-primary/30"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Gerar Notificação
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {selectedCompany && (
        <NotificationModal
          company={selectedCompany}
          clientName={searchedName}
          onClose={() => setSelectedCompany(null)}
        />
      )}
    </>
  )
}
