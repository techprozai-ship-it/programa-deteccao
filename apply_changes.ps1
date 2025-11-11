# Script para aplicar as alterações feitas pelo assistente.
# Execute na raiz do projeto PowerShell:
# powershell -ExecutionPolicy Bypass -File .\apply_changes.ps1

$files = @{
  ".gitignore" = @'
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules

# next.js
/.next/
/out/

# production
/build

# pnpm
.pnpm-store/

# Environment files (do NOT commit secrets)
.env
.env.local
.env.*

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files
.env*
.env.local
.env.*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# Optional: lockfile for pnpm (usually committed)
# pnpm-lock.yaml
'@

  ".env.example" = @'
# Copy this file to .env.local and fill the values. Do NOT commit your real keys.

# Required: Google Generative API key (used server-side)
COMPANY_SEARCH_API_KEY=your_gemini_api_key_here

# Optional: OpenCorporates API key (useful for higher quota). Leave blank if you don't have one.
OPENCORPORATES_API_KEY=your_opencorporates_api_key_here

# Example public flag for the frontend (optional)
NEXT_PUBLIC_EXAMPLE_FLAG=true
'@

  "README.md" = @'
# Programa Detecção

Projeto Next.js que pesquisa empresas usando o Google Generative AI (Gemini) e enriquece com dados do OpenCorporates.

## Quick start

1. Copie o exemplo de variáveis de ambiente e preencha com suas chaves:

```powershell
copy .env.example .env.local
# editar .env.local e colocar COMPANY_SEARCH_API_KEY
notepad .env.local
```

2. Instale dependências (usa pnpm):

```powershell
pnpm install
```

3. Rode em modo desenvolvimento:

```powershell
pnpm run dev
```

4. Teste o endpoint (ajuste a porta se necessário):

```powershell
Invoke-RestMethod -Uri 'http://localhost:3000/api/search?companyName=rafitec' -Method Get | ConvertTo-Json -Depth 5
```

## Variáveis de ambiente
- `COMPANY_SEARCH_API_KEY` (required) — chave de API do Google Generative (server-side).
- `OPENCORPORATES_API_KEY` (optional) — chave da OpenCorporates (melhora cota).

Nunca commit os arquivos `.env.local` ou chaves reais — use o `.env.example` como guia.

## Observações
- O endpoint `/api/search` usa o SDK do Gemini, mas o código tenta listar modelos públicos quando encontra erros e usa um fallback (`models/text-bison-001`) para maior compatibilidade.
- Se você receber 404/403 ao listar modelos, verifique se a API "Generative Language API" está habilitada no Console Google Cloud e se o billing está configurado.

## Subir para o GitHub
- Assegure que `.gitignore` contenha as entradas para `.env*`, `node_modules/`, `.next/`.
- Comandos básicos Git (PowerShell):

```powershell
git add .
git commit -m "Prepare repo: add env.example, README, gitignore updates, remove Claude stubs"
# criar remote e push (ajuste URL)
# git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
# git branch -M main
# git push -u origin main
```
'@

  "app/api/search/route.ts" = @'
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
// no local file flags (Claude) — Claude integration removed per project decision

// Consulta os endpoints públicos do Google Generative para descobrir modelos disponíveis
async function getBestModelName(apiKey: string): Promise<string | null> {
  try {
    const endpoints = [
      'https://generativelanguage.googleapis.com/v1/models',
      'https://generativelanguage.googleapis.com/v1beta/models',
    ];
    let models: string[] = [];
    for (const ep of endpoints) {
      try {
        const url = `${ep}?key=${encodeURIComponent(apiKey)}`;
        const res = await fetch(url);
        if (!res.ok) continue;
        const body = await res.json().catch(() => null);
        if (!body) continue;
        if (Array.isArray(body?.models)) {
          models = body.models.map((m: any) => m.name || m.id || (m as any).model || JSON.stringify(m));
        } else if (Array.isArray(body)) {
          models = body.map((m: any) => m.name || m.id || JSON.stringify(m));
        } else if (Array.isArray(body?.model)) {
          models = body.model.map((m: any) => m.name || m.id || JSON.stringify(m));
        }
        if (models.length) break;
      } catch (e) {
        // ignore and try next endpoint
      }
    }

    if (!models.length) return null;

    // Prefer explicit gemini flash models, then any gemini, then any model
    const candidates = [
      ...models.filter((n) => /gemini-?\d*\.\d*-flash|gemini-.*-flash|gemini-.*flash/i.test(n)),
      ...models.filter((n) => /gemini/i.test(n)),
      ...models,
    ];

    for (const c of candidates) {
      if (c) return c;
    }
    return models[0] || null;
  } catch (e) {
    return null;
  }
}


// Esta função será executada no lado do servidor
export async function GET(request: Request) {
  // Acessa a chave da API do ambiente.
  // Esta variável NÃO precisa de NEXT_PUBLIC_ porque só é acessada no servidor.
  const GEMINI_API_KEY = process.env.COMPANY_SEARCH_API_KEY;

  if (!GEMINI_API_KEY) {
    console.error('A chave da API do Gemini (COMPANY_SEARCH_API_KEY) não está definida nas variáveis de ambiente.');
    return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 });
  }

  // Extrai o companyName a partir dos query params (ex: ?companyName=Nome)
  const url = new URL(request.url);
  const companyName = url.searchParams.get('companyName') || url.searchParams.get('q') || '';

  if (!companyName) {
    return NextResponse.json({ error: 'Parâmetro companyName ausente' }, { status: 400 });
  }

  let genAI: any = null;
  let prompt: string = '';

  try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    // Seleção e tentativa de modelos: tentamos o modelo descoberto, variantes com/sem
    // prefixo `models/` e alguns fallbacks conhecidos para reduzir 404/NOT_FOUND.
    const discovered = await getBestModelName(GEMINI_API_KEY);
    const candidatesToTry = new Set<string>();
    if (discovered) candidatesToTry.add(discovered);
    // add variants: with and without models/ prefix
    if (discovered && !discovered.startsWith('models/')) candidatesToTry.add(`models/${discovered}`);
    if (discovered && discovered.startsWith('models/')) candidatesToTry.add(discovered.replace(/^models\//, ''));
    // safe known fallbacks
    candidatesToTry.add('models/text-bison-001');
    candidatesToTry.add('text-bison-001');
    candidatesToTry.add('models/gemini-2.5');
    candidatesToTry.add('gemini-2.5');

    console.log('Model candidates to try:', Array.from(candidatesToTry));

  prompt = `
      Você é um assistente especialista em pesquisa de dados de empresas.
      A tarefa: encontre TODOS os resultados direcionados relevantes para a pesquisa "${companyName}".
      A tarefa: encontre TODOS os resultados direcionados relevantes para a pesquisa "${companyName}", com foco exclusivo em empresas localizadas no Brasil.
      - A busca deve ser restrita a empresas registradas e operando no Brasil.
      - Priorize resultados reais e verificáveis quando possível. Se não for possível confirmar um dado, indique null ou uma string vazia.
  - Para cada resultado, forneça as seguintes propriedades quando disponíveis: nome (name), score de similaridade (0-100) em relação ao termo pesquisado (similarity), um campo "match_type" indicando se é "exact", "similar" ou "approximate", CNPJ (pode ser null se desconhecido), status (Ativa, Suspensa, etc.), endereço (cidade e estado), site/URL do negócio (website) e perfil do Instagram (instagram).
  - Defina "match_type" com base na similarity: >=95 => "exact", 70-94 => "similar", <70 => "approximate".
  - Para cada resultado, forneça as seguintes propriedades quando disponíveis: nome (name), score de similaridade (0-100) em relação ao termo pesquisado (similarity), um campo "match_type" indicando se é "exact", "similar" ou "approximate", CNPJ (formato XX.XXX.XXX/XXXX-XX), status (Ativa, Suspensa, etc.), endereço (cidade e estado no Brasil), site/URL do negócio (website) e perfil do Instagram (instagram).
  - Defina "match_type" com base na similaridade (similarity): >=95 => "exact", 70-94 => "similar", <70 => "approximate".
  - Retorne todos os resultados relevantes (não limite necessariamente a 6). Se houver muitos, retorne até 50 resultados ordenados por relevância (maior similarity primeiro).

      Retorne os resultados como um array de objetos JSON, seguindo estritamente este formato de schema:
      {
        "type": "array",
        "items": {
          "type": "object",
            "properties": {
            "name": { "type": "string" },
            "similarity": { "type": "number" },
            "match_type": { "type": "string", "enum": ["exact","similar","approximate"] },
            "cnpj": { "type": ["string","null"] },
            "status": { "type": ["string","null"] },
            "address": { "type": ["string","null"] },
            "website": { "type": ["string","null"] },
            "instagram": { "type": ["string","null"] }
          },
          "required": ["name", "similarity", "match_type"]
        }
      }

      Observação importante: NÃO invente endereços, CNPJs, sites ou perfis. Se não puder confirmar uma informação, use null.
    `;
    // Claude removed — generate response with the configured Gemini model
    async function tryGenerateWithModel(modelName: string, prm: string) {
      try {
        const m = genAI.getGenerativeModel({ model: modelName, generationConfig: { responseMimeType: 'application/json' } });
        const r = await m.generateContent(prm);
        return r;
      } catch (e) {
        throw e;
      }
    }

    // Tentar gerar usando os modelos candidatos em ordem até obter sucesso
    let result: any = null;
    let lastErr: any = null;
    for (const candidate of Array.from(candidatesToTry)) {
      try {
        console.log('Tentando modelo:', candidate);
        result = await tryGenerateWithModel(candidate, prompt);
        console.log('Modelo funcionou:', candidate);
        break;
      } catch (e) {
        lastErr = e;
        console.warn('Falha no modelo', candidate, (e as any)?.message || e);
        continue;
      }
    }

    if (!result) {
      console.error('Nenhum modelo candidato funcionou. Último erro:', lastErr);
      // fornecer lista de candidatos tentados para diagnóstico no cliente
      return NextResponse.json({ error: 'Nenhum modelo disponível para fornecer resposta.', tried: Array.from(candidatesToTry) }, { status: 502 });
    }

    // Extrai o texto da resposta com várias estratégias para lidar com formas diferentes
    async function extractTextFromResult(res: any) {
      try {
        // Newer SDKs sometimes put a `response` with a .text() helper
        if (res?.response) {
          const r = res.response;
          if (typeof r.text === 'function') return await r.text();
          if (typeof r === 'string') return r;
        }

        // Older or alternative shapes: output -> content -> text
        if (Array.isArray(res?.output) && res.output.length) {
          const parts: string[] = [];
          for (const out of res.output) {
            if (Array.isArray(out?.content)) {
              for (const c of out.content) {
                if (typeof c?.text === 'string') parts.push(c.text);
                else if (typeof c === 'string') parts.push(c);
              }
            } else if (typeof out === 'string') {
              parts.push(out);
            }
          }
          if (parts.length) return parts.join('\n');
        }

        // Fallback: candidates or direct properties
        if (Array.isArray(res?.candidates) && res.candidates.length) {
          const candParts: string[] = [];
          for (const c of res.candidates) {
            if (typeof c?.content === 'string') candParts.push(c.content);
            else if (Array.isArray(c?.content)) {
              for (const cc of c.content) if (typeof cc?.text === 'string') candParts.push(cc.text);
            } else if (typeof c?.text === 'string') candParts.push(c.text);
          }
          if (candParts.length) return candParts.join('\n');
        }

        // As last resort, try to stringify useful fields
        if (typeof res === 'string') return res;
        return JSON.stringify(res);
      } catch (e) {
        return String(res);
      }
    }

    const text = await extractTextFromResult(result);

    // O Gemini pode retornar o JSON dentro de um bloco de código markdown, então vamos limpá-lo.
    const cleanedJson = String(text).replace(/```json\n?/i, '').replace(/```$/, '').trim();

      try {
        const jsonResponse = JSON.parse(cleanedJson);
        // Log a small preview of the parsed response to aid debugging
        try { console.log('PARSED_JSON_RESPONSE_PREVIEW:', JSON.stringify(jsonResponse).slice(0, 2000)); } catch (e) { /* ignore */ }

        // Normaliza o formato de saída do Gemini: suporte array direto ou { items: [...] }
        let candidates: any[] = []
        if (Array.isArray(jsonResponse)) candidates = jsonResponse
        else if (Array.isArray((jsonResponse as any)?.items)) candidates = (jsonResponse as any).items
        else if (Array.isArray((jsonResponse as any)?.results)) candidates = (jsonResponse as any).results
        else if ((jsonResponse as any)?.data && Array.isArray((jsonResponse as any).data)) candidates = (jsonResponse as any).data
        else candidates = Array.isArray(jsonResponse) ? jsonResponse : [jsonResponse]

        // Helper: query OpenCorporates for a name (returns first match or null)
        async function queryOpenCorporates(name: string) {
          try {
            if (!name) return null
            const API_KEY = process.env.OPENCORPORATES_API_KEY
            const base = 'https://api.opencorporates.com/v0.4/companies/search'
            const params = new URLSearchParams({ q: name, jurisdiction_code: 'br', per_page: '3' })
            if (API_KEY) params.set('api_token', API_KEY)
            const url = `${base}?${params.toString()}`
            const res = await fetch(url)
            if (!res.ok) return null
            const body = await res.json().catch(() => null)
            const companies = Array.isArray(body?.results?.companies) ? body.results.companies : Array.isArray(body?.companies) ? body.companies : []
            if (!companies.length) return null
            const c = companies[0].company || companies[0]
            return {
              name: c.name || null,
              company_number: c.company_number || null,
              jurisdiction_code: c.jurisdiction_code || null,
              current_status: c.current_status || null,
              registered_address: c.registered_address || null,
              incorporation_date: c.incorporation_date || null,
              source: c.source || null,
              raw: c,
            }
          } catch (e) {
            return null
          }
        }

        // Enriquecer candidatos com dados verificados do OpenCorporates (top 6)
        const enriched = []
        const limit = Math.min(candidates.length, 6)
        for (let i = 0; i < limit; i++) {
          const item = candidates[i]
          const name = (item?.name || item?.title || item?.company || item)?.toString ? (item.name || item.title || item.company || item) : String(item)
          const verified = await queryOpenCorporates(String(name))
          const out: any = { ...(typeof item === 'object' ? item : { name: String(name) }) }
          if (verified) {
            out.company_number = verified.company_number
            out.jurisdiction = verified.jurisdiction_code
            out.status = verified.current_status || out.status || null
            out.address = verified.registered_address || out.address || null
            out.website = out.website || verified.source || null
            out.verified = true
            out._verified_source = 'opencorporates'
          } else {
            out.verified = false
          }
          enriched.push(out)
        }

        return NextResponse.json(enriched)
      } catch (jsonError) {
        console.error('Erro ao parsear JSON da API da IA:', jsonError);
        console.error('Resposta recebida da IA (raw):', text);
        console.error('Resposta recebida da IA (cleaned):', cleanedJson);
        return NextResponse.json({ error: 'A resposta da IA não estava no formato JSON esperado.', raw: cleanedJson }, { status: 500 });
      }
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
'@
}

# Escreve arquivos
foreach ($path in $files.Keys) {
  $content = $files[$path]
  $dir = Split-Path $path -Parent
  if ($dir -and -not (Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
  }
  Write-Output "Writing $path"
  $content | Out-File -FilePath $path -Encoding UTF8 -Force
}

# Remove stubs (se existirem)
$toDelete = @(
  "app/integrations/claude/page.tsx",
  "app/api/integrations/claude/route.ts",
  "data/claude-setting.json"
)
foreach ($p in $toDelete) {
  if (Test-Path $p) {
    Remove-Item $p -Force
    Write-Output "Removed $p"
  }
}

Write-Output "Done. Agora rode 'pnpm install' e 'pnpm run dev' como instruído no README."