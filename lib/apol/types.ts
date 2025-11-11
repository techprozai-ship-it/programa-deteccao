/**
 * Tipos TypeScript para webservices APOL
 * Baseado em: Tutorial_webservices_versao_cliente_17_0 (2).pdf
 */

// ============ TIPOS BÁSICOS ============

export interface Envolvido {
  sequencia: number;
  nome: string;
  cpfCnpj: string;
  qualidade: string; // e.g., "Titular", "Depositante", "Procurador"
}

export interface Despacho {
  numero: number;
  data: string; // YYYY-MM-DD
  tipo: string;
  descricao: string;
  observacoes?: string;
}

export interface Custo {
  codigo: string;
  descricao: string;
  valor: number;
  data: string; // YYYY-MM-DD
}

// ============ MARCA ============

export interface Marca {
  numeroProcesso: string; // e.g., "900123456789"
  numeroRegistro?: string; // Se já registrada
  estado: string; // e.g., "Pendente", "Registrada", "Rejeição"
  dataDepósito: string; // YYYY-MM-DD
  dataPublicacaoDeposito?: string;
  dataPrioridade?: string;
  dataConcessao?: string;
  dataExpiracaoRegistro?: string;
  natureza: string; // e.g., "Marca de Produto/Serviço"
  marca: string; // Nome/descrição da marca
  classe: string; // NICED class
  especificacao: string; // Descrição do produto/serviço
  desenho?: string; // Base64 ou URL para imagem
  envolvidos: Envolvido[];
  despachos: Despacho[];
  custos?: Custo[];
  observacoes?: string;
}

export interface MarcaQuery {
  numeroProcesso?: string;
  numeroRegistro?: string;
  marca?: string;
  titular?: string;
  estado?: string;
  dataDeDeposito?: string; // YYYY-MM-DD
  dataAte?: string; // YYYY-MM-DD (range query)
  pasta?: string;
  limite?: number; // Max results
  pagina?: number; // Pagination
}

// ============ PATENTE ============

export interface Patente {
  numeroProcesso: string;
  numeroConcessao?: string;
  estado: string; // e.g., "Pendente", "Concedida"
  dataDeposito: string; // YYYY-MM-DD
  dataPublicacaoDeposito?: string;
  dataPrioridade?: string;
  dataPublicacaoConcessao?: string;
  dataConcessao?: string;
  dataExpiracaoRegistro?: string;
  titulo: string;
  resumo: string;
  reivindicacoes?: string;
  desenhos?: string[]; // Base64 ou URLs
  inventores: Envolvido[];
  depositantes: Envolvido[];
  despachos: Despacho[];
  custos?: Custo[];
}

export interface PatenteQuery {
  numeroProcesso?: string;
  numeroConcessao?: string;
  titulo?: string;
  inventor?: string;
  estado?: string;
  dataDeDeposito?: string;
  dataAte?: string;
  pasta?: string;
  limite?: number;
  pagina?: number;
}

// ============ PROVIDÊNCIA ============

export interface Providencia {
  id: string;
  numeroProcesso: string;
  tipoDeProvvidencia: string; // e.g., "Despacho", "Notificação"
  dataDeProvvidencia: string; // YYYY-MM-DD
  status: string; // e.g., "Emitida", "Recebida", "Cumprida"
  descricao: string;
  dataDeRetorno?: string; // Quando for notificação
  resultado?: string;
}

export interface ProvidenciaQuery {
  numeroProcesso?: string;
  tipo?: string;
  status?: string;
  dataDe?: string;
  dataAte?: string;
  limite?: number;
  pagina?: number;
}

export interface ProvidenciaUpdate {
  status: string;
  resultado?: string;
  dataDeRetorno?: string;
}

// ============ ENVOLVIDO / PARTE ============

export interface Envolvidos {
  numeroProcesso: string;
  envolvidos: Envolvido[];
}

export interface EnvolvidosQuery {
  numeroProcesso: string;
  qualidade?: string;
  limite?: number;
  pagina?: number;
}

// ============ RPI (ÍNDICE DE PUBLICAÇÃO REVISTA) ============

export interface RPI {
  numero: number;
  data: string; // YYYY-MM-DD
  secao: string; // e.g., "Marcas", "Patentes"
  processosPublicados: {
    numeroProcesso: string;
    tipo: string;
    titulo?: string;
    titular?: string;
  }[];
}

export interface RPIQuery {
  dataInicio: string; // YYYY-MM-DD
  dataFim: string;
  secao?: string;
  limite?: number;
  pagina?: number;
}

// ============ JURÍDICO ============

export interface JuridicoProcesso {
  numeroProcesso: string;
  numeroAcao: string;
  tribunal: string;
  assunto: string;
  dataProtocolo: string; // YYYY-MM-DD
  status: string; // e.g., "Em andamento", "Sentenciado"
  sentenca?: string;
  dataSentenca?: string;
  resultado?: string; // "Procedente", "Improcedente", etc.
}

export interface JuridicoQuery {
  numeroProcesso?: string;
  numeroAcao?: string;
  tribunal?: string;
  status?: string;
  dataInicio?: string;
  dataFim?: string;
  limite?: number;
  pagina?: number;
}

// ============ CADASTRO LIVRE ============

export interface CadastroLivre {
  id: string;
  titulo: string;
  descricao: string;
  dados: Record<string, unknown>; // JSON livre
  dataCriacao: string; // YYYY-MM-DD
  dataAtualizacao: string;
  criador: string;
}

export interface CadastroLivreQuery {
  titulo?: string;
  criador?: string;
  dataInicio?: string;
  dataFim?: string;
  limite?: number;
  pagina?: number;
}

// ============ RESPOSTA API PADRÃO ============

export interface APIResponse<T> {
  sucesso: boolean;
  mensagem: string;
  dados?: T;
  erro?: string;
  timestamp: string;
}

export interface APIListResponse<T> {
  sucesso: boolean;
  mensagem: string;
  dados: T[];
  total: number;
  pagina: number;
  limite: number;
  timestamp: string;
}

// ============ AUTH ============

export interface AuthContext {
  usuario: string;
  senha: string; // In real app, use hashed tokens
  timestamp: number;
}
