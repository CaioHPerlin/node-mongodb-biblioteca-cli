import type { Livro } from "../entities/livro";

export type CreateLivroDto = Omit<Livro, "quantidadeDisponivel">;
