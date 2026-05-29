import type { ObjectId, WithId } from "mongodb";

export type EmprestimoStatus = "ativo" | "devolvido";

export interface Emprestimo {
  livro_id: ObjectId;
  usuario_nome: string;
  data_emprestimo: Date;
  data_devolucao_prevista: Date;
  data_devolucao_real?: Date;
  status: EmprestimoStatus;
}

export type EmprestimoDocument = WithId<Emprestimo>;
