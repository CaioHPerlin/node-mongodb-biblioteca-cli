import { client, closeDB, connectDB, db } from "./common/db";
import { CliMenu } from "./common/menu";
import { handleError } from "./common/utils";
import { EmprestimosMenu } from "./modules/emprestimos/emprestimos.menu";
import { EmprestimosRepository } from "./modules/emprestimos/emprestimos.repository";
import { EmprestimosService } from "./modules/emprestimos/emprestimos.service";
import { LivrosMenu } from "./modules/livros/livros.menu";
import { LivrosRepository } from "./modules/livros/livros.repository";
import { LivrosService } from "./modules/livros/livros.service";

const livrosService = new LivrosService(
  new LivrosRepository(db.collection("livros")),
);
const emprestimosService = new EmprestimosService(
  new EmprestimosRepository(db.collection("emprestimos")),
  livrosService,
  client,
);

const menus: Record<string, CliMenu> = {
  Livros: new LivrosMenu(livrosService),
  Empréstimos: new EmprestimosMenu(emprestimosService),
};

async function main() {
  await connectDB();
  console.log("\nTeste de Biblioteca MongoDB\n");

  const options = [
    ...Object.entries(menus).map(([label, currentMenu]) => ({
      label,
      action: () => currentMenu.show(),
    })),
    { label: "Sair" },
  ];
  const mainMenu = new CliMenu("Menu Principal", options);

  while (true) {
    const selectedOption = await mainMenu.selectOption();
    if (!selectedOption.action) break;
    await selectedOption.action();
  }

  mainMenu.close();
}

main().catch(handleError).finally(closeDB);
