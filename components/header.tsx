import { Scale, Shield, Sparkles } from "lucide-react"
import Link from "next/link"

export function Header() {
  return (
    <header className="border-b-2 border-primary/20 bg-gradient-to-r from-card via-card to-primary/5 backdrop-blur-md sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-6 py-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-transform">
                <Scale className="w-7 h-7 text-primary-foreground" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                RenovaSearch
              </h2>
              <p className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                Proteção de Marca Empresarial
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent/20 to-secondary/20 border-2 border-accent/30 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/20 transition-all cursor-default">
            <Shield className="w-5 h-5 text-accent" />
            <span className="text-sm font-bold text-foreground">Sistema Seguro</span>
          </div>
          <nav className="hidden lg:flex items-center gap-4">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Início
            </Link>
            <Link href="/integrations" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Integrações
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
