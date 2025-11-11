# Guia de Deployment para Programa Detecção

Este guia contém instruções para hospedar a aplicação em diferentes plataformas.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- `pnpm` instalado (`npm install -g pnpm`)
- Chave de API do Google Generative AI (obrigatória)
- Chave de API OpenCorporates (opcional, recomendada para maior cota)
- Conta em uma das plataformas de hospedagem (Vercel, Railway, Render, etc.)

## 🚀 Opção 1: Vercel (Recomendado para Next.js)

Vercel é a plataforma oficial para Next.js e oferece deploy automático do Git.

### 1. Prepare o repositório

```bash
# Certifique-se que tudo está no Git
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### 2. Deploy no Vercel

```bash
# Instale o CLI do Vercel globalmente
npm install -g vercel

# Deploy (será guiado interativamente)
vercel
```

### 3. Configure variáveis de ambiente no Vercel

Após o deploy inicial:
1. Acesse https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá para **Settings** → **Environment Variables**
4. Adicione as seguintes variáveis:
   - `COMPANY_SEARCH_API_KEY` = sua chave do Google Generative AI
   - `OPENCORPORATES_API_KEY` = sua chave da OpenCorporates (opcional)

### 4. Deploy automático

Depois de configurado, cada `git push` para a branch `main` (ou `master`) acionará deploy automático.

---

## 🚀 Opção 2: Railway

Railway oferece hospedagem simples e suporta Next.js nativamente.

### 1. Prepare o repositório

```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### 2. Connect ao Railway

1. Acesse https://railway.app
2. Clique em "New Project"
3. Selecione "Deploy from GitHub"
4. Conecte sua conta GitHub e selecione o repositório
5. Railway detectará automaticamente que é um projeto Next.js

### 3. Configure variáveis de ambiente

1. No painel do Railway, vá para **Variables**
2. Adicione:
   - `COMPANY_SEARCH_API_KEY` = sua chave
   - `OPENCORPORATES_API_KEY` = sua chave (opcional)

### 4. Aguarde o deploy

Railway fará o build automático e iniciará a aplicação.

---

## 🚀 Opção 3: Render

Render oferece hospedagem gratuita com limites e paga para produção.

### 1. Prepare o repositório

```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### 2. Connect ao Render

1. Acesse https://render.com
2. Clique em "New +"
3. Selecione "Web Service"
4. Conecte seu repositório GitHub
5. Configure:
   - **Name**: programa-deteccao
   - **Environment**: Node
   - **Build Command**: `pnpm install && pnpm run build`
   - **Start Command**: `pnpm run start`

### 3. Configure variáveis de ambiente

Adicione no painel do Render:
- `COMPANY_SEARCH_API_KEY`
- `OPENCORPORATES_API_KEY` (opcional)

---

## 🚀 Opção 4: Docker + Qualquer servidor (Azure, AWS, DigitalOcean, etc.)

Se você quiser total controle, pode usar Docker.

### 1. Crie um `Dockerfile`

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# Runtime stage
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile

EXPOSE 3000
CMD ["pnpm", "run", "start"]
```

### 2. Build da imagem Docker

```bash
docker build -t programa-deteccao:latest .
```

### 3. Execute localmente para testar

```bash
docker run -e COMPANY_SEARCH_API_KEY=sua_chave -p 3000:3000 programa-deteccao:latest
```

### 4. Deploy para seu servidor

Push a imagem para um registry (Docker Hub, Azure Container Registry, etc.) e execute no seu servidor.

---

## 📊 Variáveis de Ambiente

### Production (`.env.production`)

```
COMPANY_SEARCH_API_KEY=seu-google-generative-api-key
OPENCORPORATES_API_KEY=seu-opencorporates-api-key (opcional)
```

### Não committar secrets

Certifique-se que `.gitignore` contém:
```
.env.local
.env.production.local
.env.*.local
```

---

## 🔒 Segurança

1. **Nunca commit `.env.local` ou `.env.production`** — use as variáveis de ambiente da plataforma
2. **Use HTTPS** — todas as plataformas acima fornecem SSL/TLS gratuitamente
3. **Monitore logs** — acompanhe erros e performance
4. **Rate limiting** — considere adicionar rate limiting para `/api/search` em produção

---

## 🧪 Teste após deploy

Após o deploy estar pronto, teste o endpoint:

```bash
curl -X GET "https://seu-dominio.com/api/search?companyName=rafitec" \
  -H "Accept: application/json"
```

Ou via PowerShell:

```powershell
Invoke-RestMethod -Uri 'https://seu-dominio.com/api/search?companyName=rafitec' -Method Get | ConvertTo-Json -Depth 5
```

---

## 🆘 Troubleshooting

### Erro: "COMPANY_SEARCH_API_KEY not found"
- Certifique-se que a variável foi adicionada nas **Environment Variables** da plataforma
- Aguarde o redeploy automático (ou force um novo deploy)

### Erro: "Model not found" (404)
- Verifique se a chave do Google Generative API é válida
- Certifique-se que a "Generative Language API" está habilitada no Google Cloud Console
- Verifique se o billing está configurado

### Erro: "Timeout"
- Pode indicar que o modelo está demorando muito
- Aumente o timeout nas configurações da plataforma (se possível)
- Considere usar um modelo mais rápido

---

## 📚 Referências

- [Vercel Docs - Next.js](https://vercel.com/docs/frameworks/nextjs)
- [Railway Docs](https://railway.app/docs)
- [Render Docs](https://render.com/docs)
- [Google Generative AI - Setup](https://ai.google.dev/docs)
- [OpenCorporates API](https://opencorporates.com/api)

---

## 💡 Dicas

- Use CDN (Cloudflare, CloudFront) para melhor performance
- Configure backups automáticos
- Monitore custos (APIs podem gerar despesas)
- Implemente analytics para entender uso
- Adicione testes automatizados na CI/CD

---

**Última atualização**: 11 de Novembro de 2025
