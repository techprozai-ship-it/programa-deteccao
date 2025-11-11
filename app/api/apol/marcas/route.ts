/**
 * API Endpoint: /api/apol/marcas
 * Webservice APOL para Marcas
 * Baseado em: Tutorial_webservices_versao_cliente_17_0 (2).pdf
 *
 * Métodos:
 * - GET: Consultar marcas (com filtros)
 * - POST: Inserir marca
 * - PUT: Alterar marca (requer numeroProcesso)
 * - DELETE: Excluir marca (requer numeroProcesso)
 *
 * Autenticação: Basic Auth (username:password)
 */

import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/apol/auth";
import { marcaDb } from "@/lib/apol/database";
import type {
  APIResponse,
  APIListResponse,
  Marca,
  MarcaQuery,
} from "@/lib/apol/types";

// ============ GET /api/apol/marcas ============
/**
 * Consulta marcas com filtros opcionais
 *
 * Query Parameters:
 *  - numeroProcesso: Busca exata por número de processo
 *  - marca: Busca parcial por nome da marca
 *  - titular: Busca parcial por nome do titular
 *  - estado: Filtro por estado (Pendente, Registrada, etc.)
 *  - limite: Máximo de resultados (default: 50)
 *  - pagina: Número da página (default: 1)
 *
 * Exemplo:
 *  GET /api/apol/marcas?marca=TechPro&estado=Registrada&limite=10
 */
export async function GET(request: NextRequest) {
  const authResult = checkAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const numeroProcesso = searchParams.get("numeroProcesso");
    const marca = searchParams.get("marca");
    const titular = searchParams.get("titular");
    const estado = searchParams.get("estado");
    const limite = parseInt(searchParams.get("limite") || "50", 10);
    const pagina = parseInt(searchParams.get("pagina") || "1", 10);

    // Busca por número de processo (mais específico)
    if (numeroProcesso) {
      const marcaResult = marcaDb.getMarcaByNumeroProcesso(numeroProcesso);

      if (!marcaResult) {
        return NextResponse.json(
          {
            sucesso: false,
            mensagem: "Marca não encontrada",
            erro: `Nenhuma marca com número de processo ${numeroProcesso}`,
            timestamp: new Date().toISOString(),
          } as APIResponse<null>,
          { status: 404 }
        );
      }

      return NextResponse.json({
        sucesso: true,
        mensagem: "Marca encontrada",
        dados: marcaResult,
        timestamp: new Date().toISOString(),
      } as APIResponse<Marca>);
    }

    // Busca com filtros
    const results = marcaDb.searchMarcas({
      marca: marca || undefined,
      titular: titular || undefined,
      estado: estado || undefined,
      limit: limite,
      page: pagina,
    });

    const total = marcaDb.getTotalCount();

    return NextResponse.json({
      sucesso: true,
      mensagem: "Marcas encontradas",
      dados: results,
      total,
      pagina,
      limite,
      timestamp: new Date().toISOString(),
    } as APIListResponse<Marca>);
  } catch (error) {
    console.error("Erro ao consultar marcas:", error);
    return NextResponse.json(
      {
        sucesso: false,
        mensagem: "Erro ao consultar marcas",
        erro: String(error),
        timestamp: new Date().toISOString(),
      } as APIResponse<null>,
      { status: 500 }
    );
  }
}

// ============ POST /api/apol/marcas ============
/**
 * Insere nova marca
 *
 * Body (JSON):
 * {
 *   "marca": "NomeMarca",
 *   "classe": "42",
 *   "especificacao": "Descrição do produto/serviço",
 *   "natureza": "Marca de Produto/Serviço",
 *   "envolvidos": [{
 *     "sequencia": 1,
 *     "nome": "Empresa Ltda",
 *     "cpfCnpj": "12345678000100",
 *     "qualidade": "Titular"
 *   }],
 *   "despachos": [],
 *   "dataDepósito": "2024-01-15"
 * }
 */
export async function POST(request: NextRequest) {
  const authResult = checkAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();

    // Validação básica
    if (!body.marca || !body.classe || !body.especificacao) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: "Dados inválidos",
          erro: "Campo obrigatório faltando: marca, classe ou especificacao",
          timestamp: new Date().toISOString(),
        } as APIResponse<null>,
        { status: 400 }
      );
    }

    // Criar nova marca
    const novaMarca: Marca = {
      numeroProcesso: "", // Será gerado pelo DB
      estado: "Pendente",
      dataDepósito: body.dataDepósito || new Date().toISOString().split("T")[0],
      natureza: body.natureza || "Marca de Produto/Serviço",
      marca: body.marca,
      classe: body.classe,
      especificacao: body.especificacao,
      envolvidos: body.envolvidos || [],
      despachos: body.despachos || [],
      observacoes: body.observacoes,
    };

    const created = marcaDb.createMarca(novaMarca);

    return NextResponse.json(
      {
        sucesso: true,
        mensagem: "Marca inserida com sucesso",
        dados: created,
        timestamp: new Date().toISOString(),
      } as APIResponse<Marca>,
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao inserir marca:", error);
    return NextResponse.json(
      {
        sucesso: false,
        mensagem: "Erro ao inserir marca",
        erro: String(error),
        timestamp: new Date().toISOString(),
      } as APIResponse<null>,
      { status: 500 }
    );
  }
}

// ============ PUT /api/apol/marcas ============
/**
 * Altera marca existente
 * Query parameter: numeroProcesso (obrigatório)
 *
 * Body (JSON): Campos a atualizar
 * {
 *   "estado": "Registrada",
 *   "dataConcessao": "2024-06-15",
 *   "numeroRegistro": "942123456"
 * }
 */
export async function PUT(request: NextRequest) {
  const authResult = checkAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const numeroProcesso = request.nextUrl.searchParams.get("numeroProcesso");

    if (!numeroProcesso) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: "Parâmetro obrigatório faltando",
          erro: "numeroProcesso é obrigatório como query parameter",
          timestamp: new Date().toISOString(),
        } as APIResponse<null>,
        { status: 400 }
      );
    }

    const body = await request.json();
    const updated = marcaDb.updateMarca(numeroProcesso, body);

    if (!updated) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: "Marca não encontrada",
          erro: `Nenhuma marca com número de processo ${numeroProcesso}`,
          timestamp: new Date().toISOString(),
        } as APIResponse<null>,
        { status: 404 }
      );
    }

    return NextResponse.json({
      sucesso: true,
      mensagem: "Marca alterada com sucesso",
      dados: updated,
      timestamp: new Date().toISOString(),
    } as APIResponse<Marca>);
  } catch (error) {
    console.error("Erro ao alterar marca:", error);
    return NextResponse.json(
      {
        sucesso: false,
        mensagem: "Erro ao alterar marca",
        erro: String(error),
        timestamp: new Date().toISOString(),
      } as APIResponse<null>,
      { status: 500 }
    );
  }
}

// ============ DELETE /api/apol/marcas ============
/**
 * Exclui marca
 * Query parameter: numeroProcesso (obrigatório)
 *
 * Exemplo:
 *  DELETE /api/apol/marcas?numeroProcesso=900001234567
 */
export async function DELETE(request: NextRequest) {
  const authResult = checkAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const numeroProcesso = request.nextUrl.searchParams.get("numeroProcesso");

    if (!numeroProcesso) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: "Parâmetro obrigatório faltando",
          erro: "numeroProcesso é obrigatório como query parameter",
          timestamp: new Date().toISOString(),
        } as APIResponse<null>,
        { status: 400 }
      );
    }

    const deleted = marcaDb.deleteMarca(numeroProcesso);

    if (!deleted) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: "Marca não encontrada",
          erro: `Nenhuma marca com número de processo ${numeroProcesso}`,
          timestamp: new Date().toISOString(),
        } as APIResponse<null>,
        { status: 404 }
      );
    }

    return NextResponse.json({
      sucesso: true,
      mensagem: "Marca excluída com sucesso",
      timestamp: new Date().toISOString(),
    } as APIResponse<null>);
  } catch (error) {
    console.error("Erro ao excluir marca:", error);
    return NextResponse.json(
      {
        sucesso: false,
        mensagem: "Erro ao excluir marca",
        erro: String(error),
        timestamp: new Date().toISOString(),
      } as APIResponse<null>,
      { status: 500 }
    );
  }
}
