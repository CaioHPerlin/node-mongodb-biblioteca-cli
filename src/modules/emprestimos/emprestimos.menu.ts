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
      { label: "Listar atrasados", action: () => this.listOverdue() },
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
    this.printTable(activeEmprestimos, "Nenhum empréstimo ativo.");
  }

  private async listOverdue() {
    const overdueEmprestimos = await this.service.findOverdueForDisplay();
    this.printTable(overdueEmprestimos, "Nenhum empréstimo atrasado.");
  }

  private async create() {
    const livroId = await this.prompt("ID do livro: ");
    const usuarioNome = await this.prompt("Nome do usuário: ");
    const diasEmprestimo = await this.prompt(
      "Dias de empréstimo (padrão 14): ",
    );
    const emprestimo = await this.service.create({
      livroId,
      usuarioNome,
      diasEmprestimo: diasEmprestimo ? Number(diasEmprestimo) : 14,
    });
    console.log(`✅ Empréstimo registrado: ${emprestimo._id.toString()}`);
  }

  private async registerReturn() {
    const emprestimoId = await this.prompt("ID do empréstimo: ");
    const emprestimo = await this.service.completeReturn(emprestimoId);
    console.log(
      `✅ Devolução registrada para o empréstimo ${emprestimo._id.toString()}.`,
    );
  }

  private printTable(
    emprestimos: Awaited<ReturnType<EmprestimosService["findAllForDisplay"]>>,
    emptyMessage = "Nenhum empréstimo cadastrado.",
  ) {
    if (emprestimos.length === 0) {
      console.log(emptyMessage);
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
