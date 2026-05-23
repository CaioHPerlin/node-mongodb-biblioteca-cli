import { CliMenu, type MenuOption } from "../../common/menu";
import type { Autor } from "./entities/autor";
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
        Autores: livro.autores
          .map((autor) => `${autor.nome} (${autor.nacionalidade})`)
          .join(", "),
        Gênero: livro.genero,
        Ano: livro.anoPublicacao,
        Páginas: livro.paginas,
        Disponibilidade: `${livro.quantidadeDisponivel}/${livro.quantidadeTotal}`,
      })),
    );
  }

  private async create() {
    const titulo = await this.prompt("Título: ");
    const autores = await this.collectAuthors();
    const anoPublicacao = await this.prompt("Ano: ");
    const genero = await this.prompt("Gênero: ");
    const paginas = await this.prompt("Páginas: ");
    const quantidadeTotal = await this.prompt("Quantidade: ");

    const livro = await this.service.create({
      titulo,
      genero,
      anoPublicacao: Number(anoPublicacao),
      paginas: Number(paginas),
      quantidadeTotal: Number(quantidadeTotal),
      autores,
    });
    console.log(`✅ Livro criado: ${livro._id.toString()}`);
  }

  private async collectAuthors(): Promise<Autor[]> {
    const autores: Autor[] = [];

    while (true) {
      const authorIndex = autores.length + 1;
      const nome = await this.prompt(`Autor ${authorIndex} - nome: `);
      const nacionalidade = await this.prompt(
        `Autor ${authorIndex} - nacionalidade: `,
      );

      autores.push({ nome, nacionalidade });

      const shouldAddAnother = await this.prompt(
        "Adicionar outro autor? (s/n): ",
      );
      if (shouldAddAnother.trim().toLowerCase() !== "s") {
        return autores;
      }
    }
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
