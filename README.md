# Programa Detecção 🔍

Plataforma inteligente de busca de empresas no Brasil usando **Google Generative AI (Gemini)** e **OpenCorporates**.

Pesquisa empresas em tempo real, enriquece dados com informações públicas verificadas e retorna resultados estruturados em JSON.

## 📋 Características

- ✅ **Busca com IA**: integração com Google Generative AI para análise semântica
- ✅ **Enriquecimento de dados**: verificação com OpenCorporates (CNPJ, status, etc.)
- ✅ **API REST**: endpoint `/api/search` retornando JSON estruturado
- ✅ **Fallback robusto**: tenta múltiplos modelos em caso de indisponibilidade
- ✅ **Pronto para produção**: build otimizado, logs, tratamento de erros
- ✅ **Hospedagem flexível**: suporta Vercel, Railway, Render, Docker, etc.

## 🚀 Quick Start (Desenvolvimento Local)

### Pré-requisitos
- Node.js 18+
- `pnpm` (ou `npm`)

### 1. Clonar e configurar

```bash
git clone https://github.com/seu-usuario/programa-deteccao.git
cd programa-deteccao
```

### 2. Configurar variáveis de ambiente

```bash
copy .env.example .env.local
# Editar .env.local e adicionar COMPANY_SEARCH_API_KEY (obrigatório)
notepad .env.local
```

### 3. Instalar dependências

```bash
pnpm install
```

### 4. Rodar em desenvolvimento

```bash
pnpm run dev
```

Servidor estará em `http://localhost:3000`

### 5. Testar o endpoint

```bash
# PowerShell
Invoke-RestMethod -Uri 'http://localhost:3000/api/search?companyName=rafitec' -Method Get | ConvertTo-Json -Depth 5

# Bash/Linux
curl -X GET "http://localhost:3000/api/search?companyName=rafitec" | jq
```

**Resposta esperada** (array de empresas encontradas):
```json
[
  {
    "name": "Empresa A",
    "similarity": 95,
    "match_type": "exact",
    "cnpj": "12.345.678/0001-00",
    "status": "Ativa",
    "address": "São Paulo, SP",
    "website": "https://empresa-a.com",
    "instagram": "@empresa_a",
    "verified": true
  }
]
```

## 🔑 Variáveis de Ambiente

| Variável | Tipo | Descrição |
|----------|------|-----------|
| `COMPANY_SEARCH_API_KEY` | **Obrigatório** | Chave de API do Google Generative (server-side) |
| `OPENCORPORATES_API_KEY` | Opcional | Chave OpenCorporates (melhora cota; deixar vazio usa limite gratuito) |

**⚠️ NUNCA commitar `.env.local` ou chaves reais** — use `.env.example` como guia.

## 📦 Scripts Disponíveis

```bash
pnpm run dev      # Inicia servidor de desenvolvimento
pnpm run build    # Compila para produção
pnpm run start    # Inicia servidor em produção
pnpm run lint     # Executa linter
```

## 🛠️ Projeto

```
programa-deteccao/
├── app/
│   ├── api/
│   │   └── search/route.ts         # Endpoint principal (GET /api/search)
│   │   └── integrations/
│   │       └── opencorporates/...  # Proxy para OpenCorporates
│   ├── layout.tsx
│   └── page.tsx                    # Frontend (opcional)
├── components/                     # Componentes React
├── lib/                           # Utilitários
├── public/                        # Assets estáticos
├── .env.example                   # Exemplo de variáveis
├── vercel.json                    # Configuração Vercel
├── Dockerfile                     # Para containerização
├── DEPLOYMENT.md                  # Guia de hospedagem
└── README.md
```

## 🌍 Hospedagem (Produção)

### Opção Rápida: Vercel (Recomendado)

```bash
npm install -g vercel
vercel
```

Vercel detectará automaticamente Next.js. Configure variáveis de ambiente após o deploy.

### Outras Opções

- **Railway**: Conecte seu GitHub em https://railway.app
- **Render**: Conecte seu GitHub em https://render.com
- **Docker**: `docker build -t programa-deteccao . && docker run -p 3000:3000 programa-deteccao`

Para instruções detalhadas, veja **[DEPLOYMENT.md](./DEPLOYMENT.md)**

## ✅ Pré-Deployment

Antes de fazer deploy, valide a construção:

```powershell
# PowerShell
powershell -ExecutionPolicy Bypass -File .\validate-deployment.ps1

# Bash
pnpm run build && pnpm run start
```

## 📋 Checklist de Produção

Veja **[PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)** para garantir que tudo está pronto.

## 🔧 Troubleshooting

### "Model not found" (erro 404)
- Verifique se "Generative Language API" está habilitada no [Google Cloud Console](https://console.cloud.google.com)
- Confirme que o billing está configurado
- Verifique se a chave de API está correta

### "COMPANY_SEARCH_API_KEY not found"
- Certifique-se que `.env.local` existe com a chave preenchida
- Em produção, adicione a variável nas **Environment Variables** da plataforma
- Aguarde redeploy automático (ou force novo deploy)

### "Timeout"
- A IA pode estar demorando — aumente o timeout se possível
- Tente com termo mais específico

## 📚 Documentação Técnica

- **[Google Generative AI Docs](https://ai.google.dev/docs)**
- **[OpenCorporates API](https://opencorporates.com/api)**
- **[Next.js Docs](https://nextjs.org/docs)**
- **[Vercel Deployment](https://vercel.com/docs)**

## 🤝 Contribuindo

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/minha-feature`)
3. Commit as mudanças (`git commit -m 'Add minha-feature'`)
4. Push para a branch (`git push origin feature/minha-feature`)
5. Abra um Pull Request

## 📝 Licença

MIT — veja `LICENSE` para detalhes

## 📧 Suporte

Para dúvidas ou problemas, abra uma **issue** no GitHub.

---

**Última atualização**: 11 de Novembro de 2025
