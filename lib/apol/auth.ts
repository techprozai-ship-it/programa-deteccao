/**
 * Autenticação Basic Auth para webservices APOL
 * Baseado em: Tutorial_webservices_versao_cliente_17_0 (2).pdf - Seção 7
 */

import { NextRequest, NextResponse } from "next/server";
import type { AuthContext } from "./types";

/**
 * Credenciais válidas para APOL webservices
 * Em produção, consultar banco de dados ou serviço de auth externo
 */
const VALID_CREDENTIALS = [
  {
    usuario: process.env.APOL_USER || "admin",
    senha: process.env.APOL_PASSWORD || "apol2024",
  },
  {
    usuario: process.env.APOL_API_USER || "api",
    senha: process.env.APOL_API_PASSWORD || "api-key-123",
  },
];

/**
 * Decodifica e valida header Authorization com Basic Auth
 * Formato: Authorization: Basic <base64(usuario:senha)>
 */
export function parseBasicAuth(request: NextRequest): AuthContext | null {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Basic ")) {
      return null;
    }

    const encoded = authHeader.substring(6);
    const decoded = Buffer.from(encoded, "base64").toString("utf-8");
    const [usuario, senha] = decoded.split(":");

    if (!usuario || !senha) {
      return null;
    }

    return {
      usuario,
      senha,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Erro ao decodificar Basic Auth:", error);
    return null;
  }
}

/**
 * Valida credenciais contra lista de usuários válidos
 */
export function validateCredentials(auth: AuthContext | null): boolean {
  if (!auth) return false;

  return VALID_CREDENTIALS.some(
    (cred) => cred.usuario === auth.usuario && cred.senha === auth.senha
  );
}

/**
 * Middleware para verificar autenticação
 * Retorna 401 se não autenticado
 */
export function checkAuth(request: NextRequest): AuthContext | NextResponse {
  const auth = parseBasicAuth(request);

  if (!auth || !validateCredentials(auth)) {
    return NextResponse.json(
      {
        sucesso: false,
        mensagem: "Autenticação falhou",
        erro: "Credenciais inválidas ou ausentes",
        timestamp: new Date().toISOString(),
      },
      { status: 401, headers: { "WWW-Authenticate": 'Basic realm="APOL"' } }
    );
  }

  return auth;
}

/**
 * Encode credentials to Basic Auth header format
 * Útil para testes
 */
export function encodeBasicAuth(usuario: string, senha: string): string {
  return "Basic " + Buffer.from(`${usuario}:${senha}`).toString("base64");
}
