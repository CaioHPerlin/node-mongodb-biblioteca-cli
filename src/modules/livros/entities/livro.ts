import type { WithId } from "mongodb";

export interface Livro {
  titulo: string;
  autor: string;
  isbn: string;
  exemplares_total: number;
  exemplares_disponiveis: number;
}

export type LivroDocument = WithId<Livro>;
