import Link from "next/link"

export default function IntegrationsPage() {
  return (
    <main className="container mx-auto px-6 py-16 max-w-7xl">
      <h1 className="text-4xl font-extrabold mb-6">Integrações</h1>
      <p className="mb-8 text-muted-foreground">Gerencie integrações com serviços externos.</p>

      <div className="grid gap-4 max-w-md">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-card to-primary/5 border-2 border-primary/20">
          <h2 className="text-xl font-bold">OpenCorporates</h2>
          <p className="text-sm text-muted-foreground mt-2">Integração com OpenCorporates — pesquisa pública de empresas (jurisdição BR por padrão). Adicione <code>OPENCORPORATES_API_KEY</code> em <code>.env.local</code> para aumentar cota.</p>
        </div>
      </div>
    </main>
  )
}
