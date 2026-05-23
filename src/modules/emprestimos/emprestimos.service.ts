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

  async create(data: CreateEmprestimoDto): Promise<EmprestimoDocument> {
    const livroId = parseObjectId(data.livroId, "ID do livro");
    const usuarioNome = requireNonEmpty(data.usuarioNome, "Nome do usuário");
    const diasEmprestimo = requirePositiveInteger(
      data.diasEmprestimo,
      "Dias de empréstimo",
    );

    await this.livrosService.borrow(data.livroId);

    const now = new Date();
    const dataDevolucaoPrevista = new Date(now);
    dataDevolucaoPrevista.setDate(
      dataDevolucaoPrevista.getDate() + diasEmprestimo,
    );

    return this.repository.create({
      livroId,
      usuarioNome,
      dataEmprestimo: now,
      dataDevolucaoPrevista,
    });
  }

  async completeReturn(id: string): Promise<EmprestimoDocument> {
    const emprestimoId = parseObjectId(id, "ID do empréstimo");
    const emprestimoAtual = await this.repository.findById(emprestimoId);
    if (!emprestimoAtual) {
      throw new NotFoundError(`Empréstimo ${id} não encontrado`);
    }
    if (emprestimoAtual.dataDevolucaoReal) {
      throw new ConflictError(`Empréstimo ${id} já foi devolvido`);
    }

    const now = new Date();
    const ok = await this.repository.markAsReturned(emprestimoId, now);
    if (!ok) {
      throw new ConflictError(`Empréstimo ${id} não pôde ser devolvido`);
    }

    await this.livrosService.returnBorrowed(emprestimoAtual.livroId.toString());

    return {
      ...emprestimoAtual,
      dataDevolucaoReal: now,
    };
  }

  private toDisplayItems(emprestimos: EmprestimoDocument[]) {
    const now = new Date();

    return emprestimos.map((emprestimo) => ({
      _id: emprestimo._id.toString(),
      livroId: emprestimo.livroId.toString(),
      usuarioNome: emprestimo.usuarioNome,
      dataEmprestimo: emprestimo.dataEmprestimo,
      dataDevolucaoPrevista: emprestimo.dataDevolucaoPrevista,
      dataDevolucaoReal: emprestimo.dataDevolucaoReal,
      status: this.getDisplayStatus(emprestimo, now),
    }));
  }

  private getDisplayStatus(
    emprestimo: EmprestimoDocument,
    now: Date,
  ): "ativo" | "devolvido" | "atrasado" {
    if (emprestimo.dataDevolucaoReal) {
      return "devolvido";
    }

    if (emprestimo.dataDevolucaoPrevista < now) {
      return "atrasado";
    }

    return "ativo";
  }
}
