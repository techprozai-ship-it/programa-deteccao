import { NextResponse } from 'next/server'

// GET /api/integrations/opencorporates?q=...&jurisdiction=br&per_page=3
export async function GET(request: Request) {
  const url = new URL(request.url)
  const q = url.searchParams.get('q') || url.searchParams.get('companyName')
  const jurisdiction = url.searchParams.get('jurisdiction') || 'br'
  const perPage = Number(url.searchParams.get('per_page') || url.searchParams.get('perPage') || '5')

  if (!q) {
    return NextResponse.json({ error: 'missing query param q' }, { status: 400 })
  }

  try {
    const API_KEY = process.env.OPENCORPORATES_API_KEY
    const base = 'https://api.opencorporates.com/v0.4/companies/search'
    const params = new URLSearchParams({ q, jurisdiction_code: jurisdiction, per_page: String(perPage) })
    if (API_KEY) params.set('api_token', API_KEY)
    const fetchUrl = `${base}?${params.toString()}`

    const res = await fetch(fetchUrl)
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return NextResponse.json({ error: 'OpenCorporates error', status: res.status, body: text }, { status: 502 })
    }

    const body = await res.json()
    const companiesRaw = Array.isArray(body?.results?.companies) ? body.results.companies : Array.isArray(body?.companies) ? body.companies : []

    const companies = companiesRaw.map((c: any) => {
      const company = c?.company || c
      return {
        name: company?.name ?? null,
        company_number: company?.company_number ?? null,
        jurisdiction_code: company?.jurisdiction_code ?? null,
        current_status: company?.current_status ?? null,
        registered_address: company?.registered_address ?? null,
        incorporation_date: company?.incorporation_date ?? null,
        source_url: company?.source || null,
        raw: company,
      }
    })

    return NextResponse.json({ companies })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
