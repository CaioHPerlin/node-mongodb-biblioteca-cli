import { MongoClient } from "mongodb";
import { ConflictError, NotFoundError } from "../../common/errors";
import {
  parseObjectId,
  requireNonEmpty,
  requirePositiveInteger,
} from "../../common/utils";
import type { LivrosService } from "../livros/livros.service";
import type { CreateEmprestimoDto } from "./dto/create-emprestimo.dto";
import type { EmprestimosRepository } from "./emprestimos.repository";
import type { EmprestimoDocument } from "./entities/emprestimo";

export class EmprestimosService {
  constructor(
    private readonly repository: EmprestimosRepository,
    private readonly livrosService: LivrosService,
    private readonly mongoClient: MongoClient,
  ) {}

  async findAllForDisplay() {
    return this.toDisplayItems(await this.repository.findAll());
  }

  async findActiveForDisplay() {
    return this.toDisplayItems(await this.repository.findActive());
  }

  async findOverdueForDisplay() {
    return this.toDisplayItems(await this.repository.findOverdue(new Date()));
  }

  // equivalente à registrarEmprestimo(livroId, usuarioNome)
  async create(data: CreateEmprestimoDto): Promise<EmprestimoDocument> {
    const livroId = parseObjectId(data.livroId, "ID do livro");
    const usuarioNome = requireNonEmpty(data.usuarioNome, "Nome do usuário");
    const diasEmprestimo = requirePositiveInteger(
      data.diasEmprestimo,
      "Dias de empréstimo",
    );

    const session = this.mongoClient.startSession();
    try {
      let emprestimo: EmprestimoDocument | undefined;

      await session.withTransaction(async () => {
        await this.livrosService.borrow(data.livroId, session);

        const now = new Date();
        const dataDevolucaoPrevista = new Date(now);
        dataDevolucaoPrevista.setDate(
          dataDevolucaoPrevista.getDate() + diasEmprestimo,
        );

        emprestimo = await this.repository.create(
          {
            livro_id: livroId,
            usuario_nome: usuarioNome,
            data_emprestimo: now,
            data_devolucao_prevista: dataDevolucaoPrevista,
            status: "ativo",
          },
          session,
        );
      });

      if (!emprestimo) {
        throw new Error("Falha ao registrar empréstimo");
      }

      return emprestimo;
    } finally {
      await session.endSession();
    }
  }

  // equivalente à devolverLivro(emprestimoId)
  async completeReturn(id: string): Promise<EmprestimoDocument> {
    const emprestimoId = parseObjectId(id, "ID do empréstimo");

    const session = this.mongoClient.startSession();
    try {
      let resultado: EmprestimoDocument | undefined;

      await session.withTransaction(async () => {
        const emprestimo = await this.repository.findById(
          emprestimoId,
          session,
        );
        if (!emprestimo) {
          throw new NotFoundError(`Empréstimo ${id} não encontrado`);
        }
        if (emprestimo.status !== "ativo") {
          throw new ConflictError(
            `Empréstimo ${id} não está ativo (status: ${emprestimo.status})`,
          );
        }

        const dataDevolucaoReal = new Date();

        await this.repository.updateStatus(
          emprestimoId,
          "devolvido",
          { data_devolucao_real: dataDevolucaoReal },
          session,
        );

        await this.livrosService.returnBorrowed(
          emprestimo.livro_id.toString(),
          session,
        );

        resultado = {
          ...emprestimo,
          status: "devolvido",
          data_devolucao_real: dataDevolucaoReal,
        };
      });

      if (!resultado) {
        throw new Error("Falha ao devolver livro");
      }

      return resultado;
    } finally {
      await session.endSession();
    }
  }

  private toDisplayItems(emprestimos: EmprestimoDocument[]) {
    return emprestimos.map((emprestimo) => ({
      _id: emprestimo._id.toString(),
      livroId: emprestimo.livro_id.toString(),
      usuarioNome: emprestimo.usuario_nome,
      dataEmprestimo: emprestimo.data_emprestimo,
      dataDevolucaoPrevista: emprestimo.data_devolucao_prevista,
      dataDevolucaoReal: emprestimo.data_devolucao_real,
      status: emprestimo.status,
    }));
  }
}
