# API APOL - Webservices para Marcas, Patentes e Processos

Implementação de endpoints RESTful baseada no **Tutorial_webservices_versao_cliente_17_0** da APOL (Academia do Processo Online).

## 🏗️ Arquitetura

```
lib/apol/
  ├── types.ts          # Tipos TypeScript (Marca, Patente, Providência, etc.)
  ├── auth.ts           # Autenticação Basic Auth
  └── database.ts       # Mock database (em produção: PostgreSQL/MongoDB)

app/api/apol/
  ├── marcas/
  │   ├── route.ts      # GET, POST, PUT, DELETE para Marcas
  │   └── docs/route.ts # Documentação interativa
  ├── patentes/
  │   ├── route.ts      # Endpoints para Patentes
  │   └── docs/route.ts # Documentação
  └── providencias/
      └── route.ts      # Endpoints para Providências
```

## 🔐 Autenticação

Todos os endpoints requerem **Basic Auth**:

```bash
curl -H "Authorization: Basic $(echo -n 'admin:apol2024' | base64)" \
  http://localhost:3001/api/apol/marcas
```

### Credenciais Padrão:
- **Usuário:** `admin`
- **Senha:** `apol2024`

Ou configure via variáveis de ambiente:
```env
APOL_USER=seu_usuario
APOL_PASSWORD=sua_senha
APOL_API_USER=api
APOL_API_PASSWORD=api-key-123
```

## 📋 Endpoints - Marcas

### GET /api/apol/marcas
**Listar marcas com filtros opcionais**

```bash
# Listar todas
curl -H "Authorization: Basic ..." http://localhost:3001/api/apol/marcas

# Filtrar por nome
curl -H "Authorization: Basic ..." \
  "http://localhost:3001/api/apol/marcas?marca=TechPro&estado=Registrada"

# Buscar por número de processo
curl -H "Authorization: Basic ..." \
  "http://localhost:3001/api/apol/marcas?numeroProcesso=900001234567"

# Com paginação
curl -H "Authorization: Basic ..." \
  "http://localhost:3001/api/apol/marcas?limite=20&pagina=2"
```

**Query Parameters:**
- `numeroProcesso` (string): Busca exata
- `marca` (string): Busca parcial
- `titular` (string): Nome do titular
- `estado` (string): Pendente | Registrada | Rejeição
- `limite` (number): Máximo de resultados (default: 50)
- `pagina` (number): Número da página (default: 1)

**Resposta (200 OK):**
```json
{
  "sucesso": true,
  "mensagem": "Marcas encontradas",
  "dados": [
    {
      "numeroProcesso": "900001234567",
      "numeroRegistro": "942123456",
      "marca": "TechPro",
      "estado": "Registrada",
      "classe": "42",
      "especificacao": "Serviços de desenvolvimento de software",
      "dataDepósito": "2023-01-15",
      "dataConcessao": "2023-10-10",
      "envolvidos": [
        {
          "sequencia": 1,
          "nome": "TechPro Solutions Ltda",
          "cpfCnpj": "12345678000100",
          "qualidade": "Titular"
        }
      ],
      "despachos": [...]
    }
  ],
  "total": 1,
  "pagina": 1,
  "limite": 50,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### POST /api/apol/marcas
**Criar nova marca**

```bash
curl -X POST \
  -H "Authorization: Basic ..." \
  -H "Content-Type: application/json" \
  -d '{
    "marca": "MeuBrand",
    "classe": "42",
    "especificacao": "Serviços de consultoria",
    "natureza": "Marca de Produto/Serviço",
    "dataDepósito": "2024-01-15",
    "envolvidos": [
      {
        "sequencia": 1,
        "nome": "Minha Empresa Ltda",
        "cpfCnpj": "12345678000100",
        "qualidade": "Titular"
      }
    ]
  }' \
  http://localhost:3001/api/apol/marcas
```

**Request Body (JSON):**
```json
{
  "marca": "string (obrigatório)",
  "classe": "string (obrigatório)",
  "especificacao": "string (obrigatório)",
  "natureza": "string",
  "dataDepósito": "YYYY-MM-DD",
  "envolvidos": [
    {
      "sequencia": 1,
      "nome": "string",
      "cpfCnpj": "string",
      "qualidade": "Titular|Depositante|Procurador"
    }
  ],
  "despachos": [],
  "observacoes": "string"
}
```

**Resposta (201 Created):**
```json
{
  "sucesso": true,
  "mensagem": "Marca inserida com sucesso",
  "dados": {
    "numeroProcesso": "900000000001",
    ...
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### PUT /api/apol/marcas?numeroProcesso=900001234567
**Atualizar marca existente**

```bash
curl -X PUT \
  -H "Authorization: Basic ..." \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "Registrada",
    "dataConcessao": "2024-06-15",
    "numeroRegistro": "942123456"
  }' \
  "http://localhost:3001/api/apol/marcas?numeroProcesso=900001234567"
```

**Query Parameters:**
- `numeroProcesso` (string, obrigatório): ID da marca a atualizar

**Request Body:** Qualquer campo da Marca

---

### DELETE /api/apol/marcas?numeroProcesso=900001234567
**Excluir marca**

```bash
curl -X DELETE \
  -H "Authorization: Basic ..." \
  "http://localhost:3001/api/apol/marcas?numeroProcesso=900001234567"
```

---

## 🚀 Uso Local

### 1. Instalar dependências
```bash
pnpm install
```

### 2. Iniciar servidor
```bash
pnpm dev
```

Server rodará em `http://localhost:3001`

### 3. Testar API
```bash
# Via testador interativo
open http://localhost:3001/api/apol/marcas/docs

# Via cURL
curl -H "Authorization: Basic YWRtaW46YXBvbDIwMjQ=" \
  http://localhost:3001/api/apol/marcas
```

---

## 🔄 Próximos Endpoints

- [ ] `GET/POST/PUT /api/apol/patentes` - Patentes
- [ ] `GET/POST /api/apol/providencias` - Providências
- [ ] `GET /api/apol/envolvidos` - Partes/Envolvidos
- [ ] `GET /api/apol/rpi` - Índice de Publicações
- [ ] `GET /api/apol/juridico` - Processos Jurídicos
- [ ] `GET /api/apol/cadastro-livre` - Registros Livres

---

## 🧬 Estrutura de Dados

### Marca
```typescript
interface Marca {
  numeroProcesso: string;        // ID único
  numeroRegistro?: string;       // Após concessão
  estado: string;                // Pendente | Registrada | Rejeição
  dataDepósito: string;          // YYYY-MM-DD
  dataPublicacaoDeposito?: string;
  dataPrioridade?: string;
  dataConcessao?: string;
  dataExpiracaoRegistro?: string;
  natureza: string;
  marca: string;                 // Nome da marca
  classe: string;                // Classe NICE
  especificacao: string;         // Descrição do produto/serviço
  desenho?: string;              // Base64 ou URL
  envolvidos: Envolvido[];       // Partes envolvidas
  despachos: Despacho[];         // Histórico de decisões
  custos?: Custo[];
  observacoes?: string;
}
```

---

## 📚 Documentação Completa

Base de dados: `/api/apol/marcas/docs` - Interface web interativa

---

## 🛠️ Desenvolvimento

### Adicionar novo endpoint

1. Criar arquivo em `app/api/apol/[recurso]/route.ts`
2. Importar `checkAuth` de `lib/apol/auth.ts`
3. Importar database relevante de `lib/apol/database.ts`
4. Implementar handlers: `GET`, `POST`, `PUT`, `DELETE`
5. Usar tipos de `lib/apol/types.ts`

### Exemplo mínimo:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/apol/auth";
import { marcaDb } from "@/lib/apol/database";
import type { APIResponse, Marca } from "@/lib/apol/types";

export async function GET(request: NextRequest) {
  const authResult = checkAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const data = marcaDb.getAllMarcas();
    return NextResponse.json({
      sucesso: true,
      mensagem: "Dados obtidos",
      dados: data,
      timestamp: new Date().toISOString(),
    } as APIResponse<Marca[]>);
  } catch (error) {
    return NextResponse.json(
      { sucesso: false, erro: String(error), timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
```

---

## 🐛 Troubleshooting

| Erro | Solução |
|------|---------|
| `401 Unauthorized` | Verifique header Authorization com credenciais corretas |
| `400 Bad Request` | Valide query parameters e request body |
| `404 Not Found` | Recurso com ID fornecido não existe |
| `500 Internal Server Error` | Verifique logs do servidor |

---

## 📝 Licença

Propriedade da Academia do Processo Online (APOL) - Implementação por TechPro AI

---

## 🔗 Referências

- [Tutorial APOL Webservices v17.0](./APOL_TUTORIAL.pdf)
- [RFC 7617 - Basic Authentication](https://tools.ietf.org/html/rfc7617)
- [NICE Classification](https://www.wipo.int/nice/en/)
