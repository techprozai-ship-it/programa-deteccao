# Instruções para subir (push) para o GitHub

Você apagou o arquivo com as instruções? Sem problema — abaixo está tudo o que precisa para conectar este repositório local ao GitHub e enviar (push) os commits que já foram feitos.

Passos rápidos (PowerShell):

1) Crie o repositório no GitHub

## Configurar deploy automático (Vercel via GitHub Actions)

Se você quer deploy automático quando der push para a branch `main`, eu já adicionei um workflow de GitHub Actions que faz build e chama o deploy para o Vercel.

Arquivos criados:
- `.github/workflows/deploy-vercel.yml` — workflow que executa `pnpm install`, `pnpm run build` e aciona o deploy para Vercel.
- `scripts/deploy-vercel.ps1` — helper para deploy local usando o Vercel CLI.

O workflow exige que você crie os seguintes GitHub Secrets no repositório (Settings → Secrets → Actions):

- `VERCEL_TOKEN` — token criado em https://vercel.com/account/tokens (Token com permissões de deploy).
- `VERCEL_ORG_ID` — opcional; pode ser necessário para projetos em times. Você encontra no Dashboard do Vercel (Settings → General → Project settings ou Organization settings).
- `VERCEL_PROJECT_ID` — opcional; se o action não identificar automaticamente o projeto você pode preencher com o ID do projeto (encontrado nas configurações do projeto no Vercel).

Como obter os IDs e token:
1. Acesse https://vercel.com/account/tokens e crie um token.
2. No dashboard do projeto (ou na organização), abra as configurações e copie o `Project ID` e, se aplicável, `Org ID`.
3. No GitHub → seu repositório → Settings → Secrets and variables → Actions → New repository secret, crie os segredos acima.

Observação: se preferir rodar localmente sem configurar secrets, use o script PowerShell local:

```powershell
$env:VERCEL_TOKEN = 'SEU_TOKEN_AQUI'
.\scripts\deploy-vercel.ps1
```

Quando os segredos estiverem configurados, o workflow fará deploy automático toda vez que você der push na `main`.

Se preferir outro provedor (Render/Railway/Docker) eu posso criar um workflow equivalente e instruções.

- Abra: https://github.com/new
- Nome sugerido: `programa-deteccao` (ou o que preferir)
- Não marque "Initialize this repository with a README" (porque você já tem commits locais)
- Clique em "Create repository"

2) Adicione o remote e envie os commits

Substitua `SEU_USUARIO` e `SEU_REPO` pela URL/usuário que você criou no GitHub.

```powershell
# Exemplo: substitua pelo URL que o GitHub mostrou após criar o repo
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
git branch -M main
git push -u origin main
```

Observações:
- Se seu repositório usar `master` em vez de `main`, troque `main` por `master` nos comandos acima.
- Se pedir autenticação, use suas credenciais GitHub ou um token pessoal (PAT). No Windows pode abrir um prompt gráfico para login.

3) Verifique no GitHub

- Acesse `https://github.com/SEU_USUARIO/SEU_REPO` e confirme que os arquivos aparecem.

4) Próximo: deploy (opcional)

Depois do push você pode fazer deploy imediato. Sugestões rápidas:

- Vercel (recomendado para Next.js):
	```powershell
	npm install -g vercel
	vercel
	```
	Depois, configure as Environment Variables no dashboard (COMPANY_SEARCH_API_KEY e OPENCORPORATES_API_KEY).

- Railway / Render: conecte GitHub, escolha o repo e configure env vars.

- Docker: build e push da imagem se preferir rodar em seu servidor.

Ajuda e troubleshooting rápido

- Erro: "remote origin already exists" — remova o remote antigo e adicione de novo:
	```powershell
	git remote remove origin
	git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
	```
- Erro de autenticação — gere um Personal Access Token (PAT) no GitHub e use-o como senha quando solicitado.
- Se quiser que eu gere o comando exato com a URL que você me fornecer, cole aqui a URL do repositório que criou e eu executo o comando correto para você.

Se quiser, eu mesmo executo o `git remote add` e `git push` por você — cole a URL do repositório (por exemplo: `https://github.com/techprozai-ship-it/programa-deteccao.git`) e eu rodarei os comandos nesta máquina para enviar os arquivos.

Boa! Assim que você colar a URL do repo eu empurro tudo para o GitHub.

