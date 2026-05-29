import type { ClientSession } from "mongodb";
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
    const autor = requireNonEmpty(data.autor, "Autor");
    const isbn = requireNonEmpty(data.isbn, "ISBN");
    const exemplaresTotal = requirePositiveInteger(
      data.exemplares_total,
      "Total de exemplares",
    );

    return this.repository.create({
      titulo,
      autor,
      isbn,
      exemplares_total: exemplaresTotal,
    });
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.repository.delete(
      parseObjectId(id, "ID do livro"),
    );
    if (!deleted) throw new NotFoundError(`Livro ${id} não encontrado`);
  }

  async borrow(id: string, session?: ClientSession): Promise<void> {
    const livroId = parseObjectId(id, "ID do livro");
    const ok = await this.repository.decrementAvailable(livroId, session);
    if (ok) return;

    const livro = await this.repository.findById(livroId, session);
    if (!livro) throw new NotFoundError(`Livro ${id} não encontrado`);
    throw new ConflictError(
      `Livro "${livro.titulo}" indisponível para empréstimo`,
    );
  }

  async returnBorrowed(id: string, session?: ClientSession): Promise<void> {
    const livroId = parseObjectId(id, "ID do livro");
    const ok = await this.repository.incrementAvailable(livroId, session);
    if (!ok) {
      throw new NotFoundError(`Livro ${id} não encontrado`);
    }
  }
}
