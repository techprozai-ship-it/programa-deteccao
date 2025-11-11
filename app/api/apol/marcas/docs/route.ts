/**
 * Documentação e Testes: /api/apol/marcas/docs
 * Página com exemplos de uso e testes da API de Marcas
 */

import { NextRequest, NextResponse } from "next/server";
import { encodeBasicAuth } from "@/lib/apol/auth";

export async function GET(request: NextRequest) {
  const baseUrl = request.nextUrl.origin;
  const basicAuth = encodeBasicAuth("admin", "apol2024");

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>APOL Marcas API - Documentação</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    header {
      background: #333;
      color: white;
      padding: 30px;
      text-align: center;
    }
    h1 { font-size: 2.5em; margin-bottom: 10px; }
    .subtitle { opacity: 0.9; }
    
    .content { padding: 40px; }
    h2 {
      color: #667eea;
      margin: 30px 0 15px 0;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
    }
    
    .endpoint {
      background: #f5f5f5;
      border-left: 4px solid #667eea;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }
    .method {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      color: white;
      font-weight: bold;
      margin-right: 10px;
      font-size: 0.8em;
    }
    .method.get { background: #61affe; }
    .method.post { background: #49cc90; }
    .method.put { background: #fca130; }
    .method.delete { background: #f93e3e; }
    
    .example {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 15px;
      border-radius: 4px;
      margin: 10px 0;
      overflow-x: auto;
      font-family: 'Courier New', monospace;
      font-size: 0.85em;
      line-height: 1.5;
    }
    
    .test-form {
      background: #f9f9f9;
      border: 1px solid #ddd;
      padding: 20px;
      border-radius: 4px;
      margin: 20px 0;
    }
    
    input, textarea, select {
      width: 100%;
      padding: 10px;
      margin: 8px 0;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.9em;
    }
    
    button {
      background: #667eea;
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      margin: 10px 0;
    }
    
    button:hover { background: #764ba2; }
    
    .response {
      background: #f0f0f0;
      border: 1px solid #ddd;
      padding: 15px;
      border-radius: 4px;
      margin: 10px 0;
      max-height: 400px;
      overflow-y: auto;
      font-family: monospace;
      font-size: 0.85em;
    }
    
    .auth-info {
      background: #fffbea;
      border-left: 4px solid #f0ad4e;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    
    th {
      background: #f5f5f5;
      font-weight: bold;
    }
    
    .key { color: #667eea; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🏷️ APOL Marcas API</h1>
      <p class="subtitle">Webservice para Gerenciamento de Marcas Registradas</p>
    </header>
    
    <div class="content">
      <div class="auth-info">
        <strong>🔐 Autenticação Requerida:</strong> Basic Auth<br>
        <code>Authorization: Basic ${basicAuth}</code><br>
        <small>Usuário padrão: admin | Senha padrão: apol2024</small>
      </div>

      <h2>📋 Endpoints Disponíveis</h2>

      <div class="endpoint">
        <span class="method get">GET</span> /api/apol/marcas
      </div>
      <p><strong>Descrição:</strong> Consultar marcas com filtros opcionais</p>
      <p><strong>Query Parameters:</strong></p>
      <table>
        <tr>
          <th>Parâmetro</th>
          <th>Tipo</th>
          <th>Obrigatório</th>
          <th>Descrição</th>
        </tr>
        <tr>
          <td>numeroProcesso</td>
          <td>string</td>
          <td>Não</td>
          <td>Busca exata por número de processo</td>
        </tr>
        <tr>
          <td>marca</td>
          <td>string</td>
          <td>Não</td>
          <td>Busca parcial por nome da marca</td>
        </tr>
        <tr>
          <td>titular</td>
          <td>string</td>
          <td>Não</td>
          <td>Busca pelo nome do titular</td>
        </tr>
        <tr>
          <td>estado</td>
          <td>string</td>
          <td>Não</td>
          <td>Filtro por estado (Pendente, Registrada, etc)</td>
        </tr>
        <tr>
          <td>limite</td>
          <td>number</td>
          <td>Não</td>
          <td>Máximo de resultados (default: 50)</td>
        </tr>
        <tr>
          <td>pagina</td>
          <td>number</td>
          <td>Não</td>
          <td>Número da página (default: 1)</td>
        </tr>
      </table>

      <p><strong>Exemplo de Requisição:</strong></p>
      <div class="example">
curl -H "Authorization: ${basicAuth}" \\
  "${baseUrl}/api/apol/marcas?marca=TechPro&estado=Registrada&limite=10"
      </div>

      <p><strong>Exemplo de Resposta (Sucesso):</strong></p>
      <div class="example">
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
      "dataConcessao": "2023-10-10",
      "envolvidos": [
        {
          "sequencia": 1,
          "nome": "TechPro Solutions Ltda",
          "cpfCnpj": "12345678000100",
          "qualidade": "Titular"
        }
      ]
    }
  ],
  "total": 1,
  "pagina": 1,
  "limite": 10,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
      </div>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">

      <div class="endpoint">
        <span class="method post">POST</span> /api/apol/marcas
      </div>
      <p><strong>Descrição:</strong> Inserir nova marca</p>
      <p><strong>Request Body (JSON):</strong></p>
      <div class="example">
{
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
}
      </div>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">

      <div class="endpoint">
        <span class="method put">PUT</span> /api/apol/marcas?numeroProcesso=900001234567
      </div>
      <p><strong>Descrição:</strong> Alterar dados de marca existente</p>
      <p><strong>Request Body (JSON) - Campos a atualizar:</strong></p>
      <div class="example">
{
  "estado": "Registrada",
  "dataConcessao": "2024-06-15",
  "numeroRegistro": "942123456"
}
      </div>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">

      <div class="endpoint">
        <span class="method delete">DELETE</span> /api/apol/marcas?numeroProcesso=900001234567
      </div>
      <p><strong>Descrição:</strong> Excluir marca</p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">

      <h2>🧪 Testador Interativo</h2>

      <div class="test-form">
        <h3>Listar Marcas</h3>
        <label>Filtro por nome da marca:</label>
        <input type="text" id="searchMarca" placeholder="Ex: TechPro">
        <label>Filtro por estado:</label>
        <select id="searchEstado">
          <option value="">-- Todos --</option>
          <option value="Pendente">Pendente</option>
          <option value="Registrada">Registrada</option>
          <option value="Rejeição">Rejeição</option>
        </select>
        <button onclick="testGET()">Buscar Marcas</button>
        <div class="response" id="getResponse"></div>
      </div>

      <div class="test-form">
        <h3>Buscar Marca por Número de Processo</h3>
        <input type="text" id="processNumber" placeholder="Ex: 900001234567">
        <button onclick="testGETById()">Buscar por ID</button>
        <div class="response" id="getByIdResponse"></div>
      </div>

      <div class="test-form">
        <h3>Inserir Nova Marca</h3>
        <input type="text" id="newMarca" placeholder="Nome da marca" required>
        <input type="text" id="newClasse" placeholder="Classe NICE" required>
        <input type="text" id="newEspec" placeholder="Especificação" required>
        <button onclick="testPOST()">Criar Marca</button>
        <div class="response" id="postResponse"></div>
      </div>

      <div class="test-form">
        <h3>Atualizar Marca</h3>
        <input type="text" id="updateProcess" placeholder="Número de Processo" required>
        <select id="updateEstado">
          <option value="">Novo Estado</option>
          <option value="Pendente">Pendente</option>
          <option value="Registrada">Registrada</option>
          <option value="Rejeição">Rejeição</option>
        </select>
        <button onclick="testPUT()">Atualizar Marca</button>
        <div class="response" id="putResponse"></div>
      </div>

      <div class="test-form">
        <h3>Excluir Marca</h3>
        <input type="text" id="deleteProcess" placeholder="Número de Processo" required>
        <button onclick="testDELETE()" style="background: #f93e3e;">Deletar Marca</button>
        <div class="response" id="deleteResponse"></div>
      </div>

      <h2>📚 Referências</h2>
      <ul style="margin: 15px 0; padding-left: 20px;">
        <li><a href="/api/apol/marcas">Ver API Base</a></li>
        <li><a href="https://github.com/techprozai-ship-it/programa-deteccao">GitHub Repository</a></li>
      </ul>
    </div>
  </div>

  <script>
    const baseUrl = "${baseUrl}";
    const basicAuth = "${basicAuth}";

    async function makeRequest(method, url, body = null) {
      try {
        const options = {
          method,
          headers: {
            "Authorization": basicAuth,
            "Content-Type": "application/json"
          }
        };
        if (body) options.body = JSON.stringify(body);
        
        const response = await fetch(url, options);
        const data = await response.json();
        return data;
      } catch (error) {
        return { sucesso: false, erro: error.message };
      }
    }

    async function testGET() {
      const marca = document.getElementById("searchMarca").value;
      const estado = document.getElementById("searchEstado").value;
      let url = baseUrl + "/api/apol/marcas";
      const params = [];
      if (marca) params.push("marca=" + encodeURIComponent(marca));
      if (estado) params.push("estado=" + encodeURIComponent(estado));
      if (params.length) url += "?" + params.join("&");
      
      const response = await makeRequest("GET", url);
      document.getElementById("getResponse").textContent = JSON.stringify(response, null, 2);
    }

    async function testGETById() {
      const processNumber = document.getElementById("processNumber").value;
      if (!processNumber) {
        alert("Informe o número de processo");
        return;
      }
      const url = baseUrl + "/api/apol/marcas?numeroProcesso=" + encodeURIComponent(processNumber);
      const response = await makeRequest("GET", url);
      document.getElementById("getByIdResponse").textContent = JSON.stringify(response, null, 2);
    }

    async function testPOST() {
      const marca = document.getElementById("newMarca").value;
      const classe = document.getElementById("newClasse").value;
      const espec = document.getElementById("newEspec").value;
      
      if (!marca || !classe || !espec) {
        alert("Preencha todos os campos");
        return;
      }
      
      const body = {
        marca,
        classe,
        especificacao: espec,
        natureza: "Marca de Produto/Serviço",
        dataDepósito: new Date().toISOString().split("T")[0],
        envolvidos: [{
          sequencia: 1,
          nome: "Teste Empresa",
          cpfCnpj: "12345678000100",
          qualidade: "Titular"
        }]
      };
      
      const response = await makeRequest("POST", baseUrl + "/api/apol/marcas", body);
      document.getElementById("postResponse").textContent = JSON.stringify(response, null, 2);
    }

    async function testPUT() {
      const processNumber = document.getElementById("updateProcess").value;
      const estado = document.getElementById("updateEstado").value;
      
      if (!processNumber || !estado) {
        alert("Informe o número de processo e o novo estado");
        return;
      }
      
      const url = baseUrl + "/api/apol/marcas?numeroProcesso=" + encodeURIComponent(processNumber);
      const body = { estado };
      
      const response = await makeRequest("PUT", url, body);
      document.getElementById("putResponse").textContent = JSON.stringify(response, null, 2);
    }

    async function testDELETE() {
      const processNumber = document.getElementById("deleteProcess").value;
      if (!processNumber) {
        alert("Informe o número de processo");
        return;
      }
      
      if (!confirm("Tem certeza que deseja deletar esta marca?")) {
        return;
      }
      
      const url = baseUrl + "/api/apol/marcas?numeroProcesso=" + encodeURIComponent(processNumber);
      const response = await makeRequest("DELETE", url);
      document.getElementById("deleteResponse").textContent = JSON.stringify(response, null, 2);
    }
  </script>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
