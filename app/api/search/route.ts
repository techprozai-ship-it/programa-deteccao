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

  prompt = `Você é um assistente especialista em pesquisa de dados de empresas no Brasil.

TAREFA: Encontre TODOS os resultados relevantes para a pesquisa: "${companyName}"
- Busque apenas empresas registradas e operando no Brasil.
- Retorne até 10 resultados ordenados por relevância (maior similarity primeiro).
- Priorize resultados reais e verificáveis.

Para cada resultado, forneça EXATAMENTE estas propriedades (em JSON válido):
- name: string (nome da empresa)
- similarity: número 0-100 (quão similar é ao termo pesquisado)
- match_type: "exact" (similarity >= 95), "similar" (70-94), ou "approximate" (< 70)
- cnpj: string ou null (formato XX.XXX.XXX/XXXX-XX se conhecido)
- status: string ou null (ex: "Ativa", "Suspensa")
- address: string ou null (cidade e estado)
- website: string ou null (URL do site ou negócio)
- instagram: string ou null (perfil do Instagram)

IMPORTANTE: NÃO invente dados. Use null se não puder confirmar.

Retorne APENAS um array JSON válido, SEM markdown, SEM explicações adicionais. Exemplo:
[
  {"name": "Empresa A", "similarity": 95, "match_type": "exact", "cnpj": "12.345.678/0001-00", "status": "Ativa", "address": "São Paulo, SP", "website": "https://empresa-a.com", "instagram": "@empresa_a"},
  {"name": "Empresa B", "similarity": 78, "match_type": "similar", "cnpj": null, "status": null, "address": "Rio de Janeiro, RJ", "website": null, "instagram": null}
]`;
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

    // Helper: query OpenCorporates for a name (returns first match or null)
    async function queryOpenCorporates(name: string) {
      try {
        if (!name) return null;
        const API_KEY = process.env.OPENCORPORATES_API_KEY;
        const base = 'https://api.opencorporates.com/v0.4/companies/search';
        const params = new URLSearchParams({ q: name, jurisdiction_code: 'br', per_page: '3' });
        if (API_KEY) params.set('api_token', API_KEY);
        const url = `${base}?${params.toString()}`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const body = await res.json().catch(() => null);
        const companies = Array.isArray(body?.results?.companies)
          ? body.results.companies
          : Array.isArray(body?.companies)
            ? body.companies
            : [];
        if (!companies.length) return null;
        const c = companies[0].company || companies[0];
        return {
          name: c.name || null,
          company_number: c.company_number || null,
          jurisdiction_code: c.jurisdiction_code || null,
          current_status: c.current_status || null,
          registered_address: c.registered_address || null,
          incorporation_date: c.incorporation_date || null,
          source: c.source || null,
          raw: c,
        };
      } catch (e) {
        console.error('[queryOpenCorporates] Error:', e);
        return null;
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
        // Estratégia 1: response com método .text()
        if (res?.response?.text && typeof res.response.text === 'function') {
          const txt = await res.response.text();
          if (txt) return txt;
        }

        // Estratégia 2: response com propriedade text
        if (typeof res?.response?.text === 'string') {
          return res.response.text;
        }

        // Estratégia 3: candidates[0].content.parts[0].text (formato padrão do SDK v2)
        if (
          Array.isArray(res?.candidates) &&
          res.candidates.length > 0 &&
          Array.isArray(res.candidates[0]?.content?.parts) &&
          res.candidates[0].content.parts.length > 0 &&
          typeof res.candidates[0].content.parts[0]?.text === 'string'
        ) {
          return res.candidates[0].content.parts[0].text;
        }

        // Estratégia 4: response.text (pode ser string direto)
        if (typeof res?.response?.text === 'string') {
          return res.response.text;
        }

        // Estratégia 5: candidates com content.text
        if (Array.isArray(res?.candidates) && res.candidates.length) {
          for (const c of res.candidates) {
            if (typeof c?.content?.text === 'string') return c.content.text;
            if (Array.isArray(c?.content?.parts)) {
              for (const p of c.content.parts) {
                if (typeof p?.text === 'string') return p.text;
              }
            }
          }
        }

        // Estratégia 6: output
        if (Array.isArray(res?.output) && res.output.length) {
          const parts: string[] = [];
          for (const out of res.output) {
            if (typeof out === 'string') {
              parts.push(out);
            } else if (Array.isArray(out?.content)) {
              for (const c of out.content) {
                if (typeof c?.text === 'string') parts.push(c.text);
                else if (typeof c === 'string') parts.push(c);
              }
            }
          }
          if (parts.length) return parts.join('\n');
        }

        // Fallback: stringify
        if (typeof res === 'string') return res;
        console.log('[extractTextFromResult] Falling back to JSON.stringify. Object keys:', Object.keys(res || {}));
        return JSON.stringify(res);
      } catch (e) {
        console.error('[extractTextFromResult] Error:', e);
        return String(res);
      }
    }

    const text = await extractTextFromResult(result);

    console.log('[search] Extracted text from Gemini response (first 500 chars):', text.slice(0, 500));

    // Limpa blocos markdown JSON se houver
    let cleanedJson = String(text)
      .replace(/^```(?:json)?\s*\n?/i, '') // remove ```json no início
      .replace(/\n?```$/i, '') // remove ``` no final
      .trim();

    console.log('[search] Cleaned JSON (first 500 chars):', cleanedJson.slice(0, 500));

    try {
      const jsonResponse = JSON.parse(cleanedJson);
      console.log('[search] Successfully parsed JSON');

      // Normaliza o formato de saída do Gemini
      let candidates: any[] = [];
      if (Array.isArray(jsonResponse)) {
        candidates = jsonResponse;
      } else if (Array.isArray((jsonResponse as any)?.items)) {
        candidates = (jsonResponse as any).items;
      } else if (Array.isArray((jsonResponse as any)?.results)) {
        candidates = (jsonResponse as any).results;
      } else if ((jsonResponse as any)?.data && Array.isArray((jsonResponse as any).data)) {
        candidates = (jsonResponse as any).data;
      } else if (typeof jsonResponse === 'object' && jsonResponse !== null) {
        candidates = [jsonResponse];
      }

      console.log(`[search] Found ${candidates.length} candidates after normalization`);

      if (!Array.isArray(candidates) || candidates.length === 0) {
        console.warn('[search] No candidates found in normalized response');
        return NextResponse.json([]);
      }

        // Enriquecer candidatos com dados verificados do OpenCorporates (top 6)
        const enriched = [];
        const limit = Math.min(candidates.length, 6);
        console.log(`[search] Enriching top ${limit} candidates with OpenCorporates data...`);

        for (let i = 0; i < limit; i++) {
          const item = candidates[i];
          if (!item) continue;

          // Extrai nome do candidato
          const name = item?.name || item?.title || item?.company || (typeof item === 'string' ? item : null);
          if (!name) {
            console.warn(`[search] Candidate ${i} has no name, skipping enrichment`);
            enriched.push(item);
            continue;
          }

          try {
            const verified = await queryOpenCorporates(String(name));
            const out: any = { ...(typeof item === 'object' ? item : { name: String(name) }) };

            if (verified) {
              out.company_number = verified.company_number;
              out.jurisdiction = verified.jurisdiction_code;
              out.status = verified.current_status || out.status || null;
              out.address = verified.registered_address || out.address || null;
              out.website = out.website || verified.source || null;
              out.verified = true;
              out._verified_source = 'opencorporates';
              console.log(`[search] Candidate "${name}" verified via OpenCorporates`);
            } else {
              out.verified = false;
              console.log(`[search] Candidate "${name}" not found in OpenCorporates`);
            }

            enriched.push(out);
          } catch (enrichErr) {
            console.error(`[search] Error enriching candidate ${i}:`, enrichErr);
            enriched.push(item); // push original item on error
          }
        }

        console.log(`[search] Returning ${enriched.length} enriched results`);
        return NextResponse.json(enriched);
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
