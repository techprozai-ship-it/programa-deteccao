# 🚀 Deploy em 5 Minutos

Guia ultra-rápido para colocar o Programa Detecção em produção.

## 1️⃣ Validar localmente

```powershell
# PowerShell
powershell -ExecutionPolicy Bypass -File .\validate-deployment.ps1
```

Tudo verde? Prossiga para o passo 2.

## 2️⃣ Commit e Push

```bash
git add .
git commit -m "Ready for production: Programa Detecção v1"
git push origin main
```

## 3️⃣ Escolha sua plataforma

### 🟢 Vercel (Mais rápido - 2 minutos)

```bash
npm install -g vercel
vercel
```

1. Escolha seu projeto
2. Aceite defaults (Será perguntado sobre diretório, etc.)
3. Vercel faz o deploy automático
4. Acesse `https://seu-projeto.vercel.app`

**Adicionar variáveis de ambiente:**
1. Vercel Dashboard → Seu projeto → Settings
2. Environment Variables
3. Adicione:
   - `COMPANY_SEARCH_API_KEY` = sua chave
   - `OPENCORPORATES_API_KEY` = sua chave (opcional)
4. Aguarde redeploy automático

### 🚂 Railway (2-3 minutos)

1. Acesse https://railway.app
2. "New Project" → "Deploy from GitHub"
3. Conecte sua conta GitHub
4. Selecione este repositório
5. Railway detecará automaticamente Next.js
6. Configurar variáveis em "Variables"
7. Deploy automático!

### 🎨 Render (2-3 minutos)

1. Acesse https://render.com
2. "New Web Service"
3. Conecte GitHub, selecione repo
4. Configure:
   - Build: `pnpm install && pnpm run build`
   - Start: `pnpm run start`
5. Adicione environment variables
6. Deploy!

### 🐳 Docker (Seu servidor próprio)

```bash
docker build -t programa-deteccao .
docker run -e COMPANY_SEARCH_API_KEY=sua_chave -p 3000:3000 programa-deteccao
```

Push para Docker Hub/ECR/Azure CR e deploy em seu servidor.

## 4️⃣ Testar em produção

Após deploy estar live:

```bash
curl -X GET "https://seu-dominio.com/api/search?companyName=rafitec"
```

Ou PowerShell:

```powershell
Invoke-RestMethod -Uri 'https://seu-dominio.com/api/search?companyName=rafitec' -Method Get | ConvertTo-Json -Depth 5
```

## ⚠️ Checklist final

- [ ] `.env.local` não foi commitado (verificar `.gitignore`)
- [ ] `COMPANY_SEARCH_API_KEY` está configurado na plataforma
- [ ] Build local passou (`validate-deployment.ps1`)
- [ ] Endpoint respondeu com JSON válido em produção
- [ ] Domain/URL nota em um lugar seguro

## 🆘 Deu erro?

| Erro | Solução |
|------|---------|
| "COMPANY_SEARCH_API_KEY not found" | Adicione variável de environment na plataforma, aguarde redeploy |
| "Model not found" | Verifique se a API está habilitada e billing configurado no Google Cloud |
| "Timeout" | Aumentar timeout nas configurações, ou usar termo de busca mais específico |
| "Cannot find module" | Rodar `pnpm install` e fazer novo commit/push |

Para troubleshooting detalhado, veja `DEPLOYMENT.md` e `README.md`.

---

**Dúvida?** Abra uma issue no GitHub!

✨ **Pronto!** Seu app está em produção!
