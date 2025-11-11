/**
 * Mock Database para webservices APOL
 * Em produção, conectar a banco de dados real (PostgreSQL, MongoDB, etc.)
 */

import type {
  Marca,
  Patente,
  Providencia,
  Envolvidos,
  RPI,
  JuridicoProcesso,
  CadastroLivre,
} from "./types";

// ============ MARCA DATABASE ============

class MarcaDatabase {
  private marcas: Map<string, Marca> = new Map();
  private nextId: number = 900000000001;

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const sampleMarcas: Marca[] = [
      {
        numeroProcesso: "900001234567",
        numeroRegistro: "942123456",
        estado: "Registrada",
        dataDepósito: "2023-01-15",
        dataPublicacaoDeposito: "2023-04-20",
        dataPrioridade: "2023-01-15",
        dataConcessao: "2023-10-10",
        dataExpiracaoRegistro: "2033-10-10",
        natureza: "Marca de Produto/Serviço",
        marca: "TechPro",
        classe: "42",
        especificacao: "Serviços de desenvolvimento de software",
        envolvidos: [
          {
            sequencia: 1,
            nome: "TechPro Solutions Ltda",
            cpfCnpj: "12345678000100",
            qualidade: "Titular",
          },
        ],
        despachos: [
          {
            numero: 1,
            data: "2023-04-20",
            tipo: "Publicação de Depósito",
            descricao: "Marca publicada no RPI",
          },
        ],
      },
      {
        numeroProcesso: "900002345678",
        estado: "Pendente",
        dataDepósito: "2024-06-10",
        natureza: "Marca de Produto/Serviço",
        marca: "InnovateBR",
        classe: "09",
        especificacao: "Softwares e aplicativos",
        envolvidos: [
          {
            sequencia: 1,
            nome: "Inovação Brasil S.A.",
            cpfCnpj: "98765432000199",
            qualidade: "Depositante",
          },
        ],
        despachos: [],
      },
    ];

    sampleMarcas.forEach((marca) => {
      this.marcas.set(marca.numeroProcesso, marca);
    });
  }

  getAllMarcas(limit: number = 50, page: number = 1): Marca[] {
    const start = (page - 1) * limit;
    return Array.from(this.marcas.values()).slice(start, start + limit);
  }

  getMarcaByNumeroProcesso(numeroProcesso: string): Marca | undefined {
    return this.marcas.get(numeroProcesso);
  }

  searchMarcas(criteria: {
    marca?: string;
    titular?: string;
    estado?: string;
    limit?: number;
    page?: number;
  }): Marca[] {
    const limit = criteria.limit || 50;
    const page = criteria.page || 1;

    let results = Array.from(this.marcas.values());

    if (criteria.marca) {
      results = results.filter((m) =>
        m.marca.toLowerCase().includes(criteria.marca!.toLowerCase())
      );
    }

    if (criteria.estado) {
      results = results.filter(
        (m) => m.estado.toLowerCase() === criteria.estado!.toLowerCase()
      );
    }

    if (criteria.titular) {
      results = results.filter((m) =>
        m.envolvidos.some((e) =>
          e.nome.toLowerCase().includes(criteria.titular!.toLowerCase())
        )
      );
    }

    const start = (page - 1) * limit;
    return results.slice(start, start + limit);
  }

  createMarca(marca: Marca): Marca {
    marca.numeroProcesso = String(this.nextId++);
    this.marcas.set(marca.numeroProcesso, marca);
    return marca;
  }

  updateMarca(numeroProcesso: string, updates: Partial<Marca>): Marca | null {
    const marca = this.marcas.get(numeroProcesso);
    if (!marca) return null;

    const updated = { ...marca, ...updates, numeroProcesso };
    this.marcas.set(numeroProcesso, updated);
    return updated;
  }

  deleteMarca(numeroProcesso: string): boolean {
    return this.marcas.delete(numeroProcesso);
  }

  getTotalCount(): number {
    return this.marcas.size;
  }
}

// ============ PATENTE DATABASE ============

class PatenteDatabase {
  private patentes: Map<string, Patente> = new Map();
  private nextId: number = 800000000001;

  private initializeSampleData() {
    // Sample data can be added here
  }

  getPatente(numeroProcesso: string): Patente | undefined {
    return this.patentes.get(numeroProcesso);
  }

  searchPatentes(criteria: {
    titulo?: string;
    inventor?: string;
    limit?: number;
    page?: number;
  }): Patente[] {
    const limit = criteria.limit || 50;
    const page = criteria.page || 1;

    let results = Array.from(this.patentes.values());

    if (criteria.titulo) {
      results = results.filter((p) =>
        p.titulo.toLowerCase().includes(criteria.titulo!.toLowerCase())
      );
    }

    if (criteria.inventor) {
      results = results.filter((p) =>
        p.inventores.some((e) =>
          e.nome.toLowerCase().includes(criteria.inventor!.toLowerCase())
        )
      );
    }

    const start = (page - 1) * limit;
    return results.slice(start, start + limit);
  }

  createPatente(patente: Patente): Patente {
    this.patentes.set(patente.numeroProcesso, patente);
    return patente;
  }

  updatePatente(
    numeroProcesso: string,
    updates: Partial<Patente>
  ): Patente | null {
    const patente = this.patentes.get(numeroProcesso);
    if (!patente) return null;

    const updated = { ...patente, ...updates, numeroProcesso };
    this.patentes.set(numeroProcesso, updated);
    return updated;
  }

  deletePaten(numeroProcesso: string): boolean {
    return this.patentes.delete(numeroProcesso);
  }
}

// ============ PROVIDÊNCIA DATABASE ============

class ProvidenciaDatabase {
  private providencias: Map<string, Providencia> = new Map();
  private nextId: number = 1;

  getProvidencia(id: string): Providencia | undefined {
    return this.providencias.get(id);
  }

  getProvidenciasByProcesso(numeroProcesso: string): Providencia[] {
    return Array.from(this.providencias.values()).filter(
      (p) => p.numeroProcesso === numeroProcesso
    );
  }

  createProvidencia(providencia: Providencia): Providencia {
    providencia.id = String(this.nextId++);
    this.providencias.set(providencia.id, providencia);
    return providencia;
  }

  updateProvidencia(
    id: string,
    updates: Partial<Providencia>
  ): Providencia | null {
    const providencia = this.providencias.get(id);
    if (!providencia) return null;

    const updated = { ...providencia, ...updates, id };
    this.providencias.set(id, updated);
    return updated;
  }
}

// ============ SINGLETON INSTANCES ============

export const marcaDb = new MarcaDatabase();
export const patenteDb = new PatenteDatabase();
export const providenciaDb = new ProvidenciaDatabase();
