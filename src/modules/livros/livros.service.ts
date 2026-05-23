import { ConflictError, NotFoundError } from "../../common/errors";
import {
  parseObjectId,
  requireNonEmpty,
  requirePositiveInteger,
} from "../../common/utils";
import type { CreateLivroDto } from "./dto/create-livro.dto";
import type { LivroDocument } from "./entities/livro";
import type { LivrosRepository } from "./livros.repository";

export class LivrosService {
  constructor(private readonly repository: LivrosRepository) {}

  async findAll(): Promise<LivroDocument[]> {
    return this.repository.findAll();
  }

  async create(data: CreateLivroDto): Promise<LivroDocument> {
    const titulo = requireNonEmpty(data.titulo, "Título");
    const genero = requireNonEmpty(data.genero, "Gênero");
    const anoPublicacao = requirePositiveInteger(
      data.anoPublicacao,
      "Ano de publicação",
    );
    const paginas = requirePositiveInteger(data.paginas, "Páginas");
    const quantidadeTotal = requirePositiveInteger(
      data.quantidadeTotal,
      "Quantidade",
    );

    if (data.autores.length === 0) {
      throw new ConflictError("Informe ao menos um autor");
    }

    const autores = data.autores.map((autor) => ({
      nome: requireNonEmpty(autor.nome, "Nome do autor"),
      nacionalidade: requireNonEmpty(
        autor.nacionalidade,
        "Nacionalidade do autor",
      ),
    }));

    return this.repository.create({
      titulo,
      genero,
      anoPublicacao,
      paginas,
      quantidadeTotal,
      autores,
    });
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.repository.delete(
      parseObjectId(id, "ID do livro"),
    );
    if (!deleted) throw new NotFoundError(`Livro ${id} não encontrado`);
  }

  async borrow(id: string): Promise<void> {
    const livroId = parseObjectId(id, "ID do livro");
    const ok = await this.repository.decrementAvailable(livroId);
    if (ok) return;

    const livro = await this.repository.findById(livroId);
    if (!livro) throw new NotFoundError(`Livro ${id} não encontrado`);
    throw new ConflictError(
      `Livro ${livro.titulo} indisponível para empréstimo`,
    );
  }

  async returnBorrowed(id: string): Promise<void> {
    const livroId = parseObjectId(id, "ID do livro");
    const ok = await this.repository.incrementAvailable(livroId);
    if (!ok) {
      throw new NotFoundError(`Livro ${id} não encontrado`);
    }
  }
}
