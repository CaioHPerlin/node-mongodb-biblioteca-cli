import type { ObjectId, WithId } from "mongodb";

export interface Emprestimo {
  livroId: ObjectId;
  usuarioNome: string;
  dataEmprestimo: Date;
  dataDevolucaoPrevista: Date;
  dataDevolucaoReal?: Date;
}

export type EmprestimoDocument = WithId<Emprestimo>;
