# 🚀 Como Testar o Módulo APOL Marcas

## Quick Start - 3 Passos

### 1️⃣ Iniciar Servidor
```powershell
cd "c:\Users\Usuario\Downloads\programa detecção"
pnpm dev
```
✅ Esperar até ver: `Ready in XXXms` e `http://localhost:3001`

### 2️⃣ Abrir Documentação Interativa
```
http://localhost:3001/api/apol/marcas/docs
```

Você verá uma **interface web completa** com:
- 📋 Documentação de todos endpoints
- 🧪 Testador interativo com formulários
- 📝 Exemplos de uso
- 🔑 Explicação da autenticação

### 3️⃣ Testar Endpoints (Escolha um)

#### Opção A: Via Interface Web (Recomendado)
1. Ir para `http://localhost:3001/api/apol/marcas/docs`
2. Preencher formulários
3. Clicar "Buscar" / "Criar" / "Atualizar" / "Deletar"
4. Ver resposta JSON formatada

#### Opção B: Via cURL (Terminal)

**GET - Listar todas as marcas**
```bash
curl -H "Authorization: Basic YWRtaW46YXBvbDIwMjQ=" ^
  http://localhost:3001/api/apol/marcas
```

**GET - Buscar marca específica**
```bash
curl -H "Authorization: Basic YWRtaW46YXBvbDIwMjQ=" ^
  "http://localhost:3001/api/apol/marcas?numeroProcesso=900001234567"
```

**GET - Filtrar por nome**
```bash
curl -H "Authorization: Basic YWRtaW46YXBvbDIwMjQ=" ^
  "http://localhost:3001/api/apol/marcas?marca=TechPro&estado=Registrada"
```

**POST - Criar marca**
```bash
curl -X POST ^
  -H "Authorization: Basic YWRtaW46YXBvbDIwMjQ=" ^
  -H "Content-Type: application/json" ^
  -d "{\"marca\":\"MyBrand\",\"classe\":\"42\",\"especificacao\":\"Teste\"}" ^
  http://localhost:3001/api/apol/marcas
```

**PUT - Atualizar marca**
```bash
curl -X PUT ^
  -H "Authorization: Basic YWRtaW46YXBvbDIwMjQ=" ^
  -H "Content-Type: application/json" ^
  -d "{\"estado\":\"Registrada\"}" ^
  "http://localhost:3001/api/apol/marcas?numeroProcesso=900001234567"
```

**DELETE - Excluir marca**
```bash
curl -X DELETE ^
  -H "Authorization: Basic YWRtaW46YXBvbDIwMjQ=" ^
  "http://localhost:3001/api/apol/marcas?numeroProcesso=900001234567"
```

---

## 📊 Dados de Exemplo (Já Existentes)

Quando você listar as marcas, verá:

```json
{
  "sucesso": true,
  "mensagem": "Marcas encontradas",
  "dados": [
    {
      "numeroProcesso": "900001234567",
      "marca": "TechPro",
      "estado": "Registrada",
      "classe": "42",
      "especificacao": "Serviços de desenvolvimento de software",
      "dataDepósito": "2023-01-15",
      "envolvidos": [
        {
          "nome": "TechPro Solutions Ltda",
          "cpfCnpj": "12345678000100",
          "qualidade": "Titular"
        }
      ]
    },
    {
      "numeroProcesso": "900002345678",
      "marca": "InnovateBR",
      "estado": "Pendente",
      "classe": "09",
      "dataDepósito": "2024-06-10"
    }
  ],
  "total": 2,
  "pagina": 1,
  "limite": 50
}
```

---

## 🔐 Autenticação

### Header Obrigatório:
```
Authorization: Basic YWRtaW46YXBvbDIwMjQ=
```

Isto é Base64 de: `admin:apol2024`

### Para outras credenciais:
```bash
# Gerar seu próprio token:
echo -n "seu_usuario:sua_senha" | base64
# Copiar resultado e usar no header
```

---

## ✅ Checklist de Funcionamento

- [ ] Servidor inicia sem erros
- [ ] Página inicial carrega (`http://localhost:3001`)
- [ ] Links APOL aparecem na página
- [ ] Clica em "Ver Documentação Completa"
- [ ] Página de docs carrega (`/api/apol/marcas/docs`)
- [ ] Testador interativo funciona
- [ ] GET retorna 2 marcas de exemplo
- [ ] POST cria nova marca
- [ ] PUT atualiza marca
- [ ] DELETE remove marca
- [ ] Sem autenticação retorna 401

---

## 🐛 Troubleshooting

| Erro | Solução |
|------|---------|
| `"Impossível conectar-se ao servidor"` | Servidor não está rodando. Execute `pnpm dev` |
| `401 Unauthorized` | Falta header `Authorization` ou credenciais inválidas |
| `404 Not Found` | URL errada ou recurso não existe |
| `400 Bad Request` | Dados obrigatórios faltando (marca, classe, especificacao) |
| CORS error | Está sendo acessado de origin diferente |

---

## 📚 Estrutura de Dados - Marca Completa

```json
{
  "numeroProcesso": "900001234567",      // ID único (gerado automaticamente)
  "numeroRegistro": "942123456",         // Apenas após concessão
  "estado": "Registrada",                // Pendente | Registrada | Rejeição
  "dataDepósito": "2023-01-15",
  "dataPublicacaoDeposito": "2023-04-20",
  "dataPrioridade": "2023-01-15",
  "dataConcessao": "2023-10-10",
  "dataExpiracaoRegistro": "2033-10-10",
  "natureza": "Marca de Produto/Serviço",
  "marca": "TechPro",
  "classe": "42",
  "especificacao": "Serviços de desenvolvimento de software",
  "desenho": "base64 ou URL da imagem",
  "envolvidos": [
    {
      "sequencia": 1,
      "nome": "TechPro Solutions Ltda",
      "cpfCnpj": "12345678000100",
      "qualidade": "Titular"              // Titular | Depositante | Procurador
    }
  ],
  "despachos": [
    {
      "numero": 1,
      "data": "2023-04-20",
      "tipo": "Publicação de Depósito",
      "descricao": "Marca publicada no RPI",
      "observacoes": "Sem observações"
    }
  ],
  "custos": [],
  "observacoes": "Observações gerais"
}
```

---

## 🧪 Teste Completo em PowerShell

```powershell
# 1. Listar
$auth = "Basic YWRtaW46YXBvbDIwMjQ="
$response = Invoke-RestMethod -Uri "http://localhost:3001/api/apol/marcas" `
  -Headers @{"Authorization"=$auth}
Write-Host ($response | ConvertTo-Json)

# 2. Criar
$body = @{
  marca = "TestMarca"
  classe = "42"
  especificacao = "Teste do sistema"
  envolvidos = @(@{
    sequencia = 1
    nome = "Empresa Teste"
    cpfCnpj = "12345678000100"
    qualidade = "Titular"
  })
} | ConvertTo-Json

$new = Invoke-RestMethod -Method Post -Uri "http://localhost:3001/api/apol/marcas" `
  -Headers @{"Authorization"=$auth; "Content-Type"="application/json"} `
  -Body $body
Write-Host "Nova marca criada: $($new.dados.numeroProcesso)"

# 3. Atualizar
$update = @{ estado = "Registrada" } | ConvertTo-Json
$id = $new.dados.numeroProcesso
$updated = Invoke-RestMethod -Method Put `
  -Uri "http://localhost:3001/api/apol/marcas?numeroProcesso=$id" `
  -Headers @{"Authorization"=$auth; "Content-Type"="application/json"} `
  -Body $update
Write-Host "Marca atualizada para estado: $($updated.dados.estado)"

# 4. Deletar
$deleted = Invoke-RestMethod -Method Delete `
  -Uri "http://localhost:3001/api/apol/marcas?numeroProcesso=$id" `
  -Headers @{"Authorization"=$auth}
Write-Host $deleted.mensagem
```

---

## 🎯 Próximos Passos

Depois de testar Marcas, podemos implementar:
- 🔬 **Patentes** - Similar a Marcas
- ⚖️ **Providências** - Para ações judiciais
- 👥 **Envolvidos** - Gerenciar partes
- 📑 **RPI** - Índice de publicações

---

## 📞 Suporte

- Documentação técnica: `/lib/apol/README.md`
- Implementação: `/app/api/apol/marcas/route.ts`
- Tipos: `/lib/apol/types.ts`
- GitHub: `https://github.com/techprozai-ship-it/programa-deteccao`

**Bom teste! 🎉**
