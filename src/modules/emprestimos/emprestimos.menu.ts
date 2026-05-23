import { CliMenu, type MenuOption } from "../../common/menu";
import { formatDate } from "../../common/utils";
import type { EmprestimosService } from "./emprestimos.service";

export class EmprestimosMenu extends CliMenu {
  constructor(private readonly service: EmprestimosService) {
    super("Empréstimos");
  }

  protected getOptions(): MenuOption[] {
    return [
      { label: "Listar todos", action: () => this.listAll() },
      { label: "Listar ativos", action: () => this.listActive() },
      { label: "Novo empréstimo", action: () => this.create() },
      { label: "Registrar devolução", action: () => this.registerReturn() },
      { label: "Voltar" },
    ];
  }

  private async listAll() {
    const emprestimos = await this.service.findAllForDisplay();
    this.printTable(emprestimos);
  }

  private async listActive() {
    const activeEmprestimos = await this.service.findActiveForDisplay();
    this.printTable(activeEmprestimos);
  }

  private async create() {
    const livroId = await this.prompt("ID do livro: ");
    const usuarioNome = await this.prompt("Nome do usuário: ");
    const diasEmprestimo = await this.prompt("Dias de empréstimo: ");
    const emprestimo = await this.service.create({
      livroId,
      usuarioNome,
      diasEmprestimo: Number(diasEmprestimo),
    });
    console.log(`✅ Empréstimo criado: ${emprestimo._id.toString()}`);
  }

  private async registerReturn() {
    const emprestimoId = await this.prompt("ID do empréstimo: ");
    await this.service.completeReturn(emprestimoId);
    console.log("✅ Devolução registrada.");
  }

  private printTable(
    emprestimos: Awaited<ReturnType<EmprestimosService["findAllForDisplay"]>>,
  ) {
    if (emprestimos.length === 0) {
      console.log("Nenhum empréstimo cadastrado.");
      return;
    }

    console.table(
      emprestimos.map((emprestimo) => ({
        _id: emprestimo._id,
        "Livro ID": emprestimo.livroId,
        Usuário: emprestimo.usuarioNome,
        Empréstimo: formatDate(emprestimo.dataEmprestimo),
        "Devolução Prevista": formatDate(emprestimo.dataDevolucaoPrevista),
        "Devolução Real": formatDate(emprestimo.dataDevolucaoReal),
        Status: emprestimo.status,
      })),
    );
  }
}
