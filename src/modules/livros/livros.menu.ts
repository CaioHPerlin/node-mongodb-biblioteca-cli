import { CliMenu, type MenuOption } from "../../common/menu";
import type { LivrosService } from "./livros.service";

export class LivrosMenu extends CliMenu {
  constructor(private readonly service: LivrosService) {
    super("Livros");
  }

  protected getOptions(): MenuOption[] {
    return [
      { label: "Listar", action: () => this.list() },
      { label: "Cadastrar", action: () => this.create() },
      { label: "Remover", action: () => this.remove() },
      { label: "Voltar" },
    ];
  }

  private async list() {
    const livros = await this.service.findAll();
    if (livros.length === 0) {
      console.log("Nenhum livro cadastrado.");
      return;
    }

    console.table(
      livros.map((livro) => ({
        _id: livro._id.toString(),
        Título: livro.titulo,
        Autor: livro.autor,
        ISBN: livro.isbn,
        Disponibilidade: `${livro.exemplares_disponiveis}/${livro.exemplares_total}`,
      })),
    );
  }

  private async create() {
    const titulo = await this.prompt("Título: ");
    const autor = await this.prompt("Autor: ");
    const isbn = await this.prompt("ISBN: ");
    const exemplaresTotal = await this.prompt("Total de exemplares: ");

    const livro = await this.service.create({
      titulo,
      autor,
      isbn,
      exemplares_total: Number(exemplaresTotal),
    });
    console.log(`✅ Livro criado: ${livro._id.toString()}`);
  }

  private async remove() {
    const livroId = await this.prompt("ID do livro: ");
    const confirmation = await this.prompt("Tem certeza? (s/n): ");
    if (confirmation.toLowerCase() === "s") {
      await this.service.delete(livroId);
      console.log("✅ Livro removido.");
    }
  }
}
