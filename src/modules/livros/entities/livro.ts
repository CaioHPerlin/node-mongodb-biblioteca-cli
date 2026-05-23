import type { WithId } from "mongodb";
import type { Autor } from "./autor";

export interface Livro {
  titulo: string;
  anoPublicacao: number;
  genero: string;
  paginas: number;
  quantidadeTotal: number;
  quantidadeDisponivel: number;
  autores: Autor[];
}

export type LivroDocument = WithId<Livro>;
