import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";
import { handleError } from "./utils";

export interface MenuOption {
  label: string;
  action?: () => Promise<void>;
}

export class CliMenu {
  private static readonly readline = createInterface({
    input,
    output,
  });

  constructor(
    private readonly title: string,
    private readonly options: MenuOption[] = [],
  ) {}

  protected getOptions(): MenuOption[] {
    return this.options;
  }

  close(): void {
    CliMenu.readline.close();
  }

  async selectOption(): Promise<MenuOption> {
    const options = this.getOptions();

    console.log(`\n── ${this.title} ──`);
    options.forEach((option, index) => {
      console.log(`  ${index + 1}. ${option.label}`);
    });

    while (true) {
      const answer = await this.prompt("\nEscolha: ");
      const selectedOption = Number(answer);
      if (selectedOption >= 1 && selectedOption <= options.length) {
        return options[selectedOption - 1];
      }
      console.log("Opção inválida.");
    }
  }

  async show(): Promise<void> {
    const selectedOption = await this.selectOption();

    if (selectedOption.action) {
      try {
        await selectedOption.action();
      } catch (error) {
        handleError(error);
      }
    }
  }

  protected prompt(question: string): Promise<string> {
    return CliMenu.readline.question(question);
  }
}
