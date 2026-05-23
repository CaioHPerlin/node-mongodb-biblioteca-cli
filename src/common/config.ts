type RawEnv = Record<string, unknown>;

class EnvConfig {
  readonly MONGODB_URL: string;

  constructor(env: RawEnv = process.env) {
    if (typeof env.MONGODB_URL !== "string" || env.MONGODB_URL.trim() === "") {
      throw new Error("MONGODB_URL deve ser uma string não vazia");
    }
    this.MONGODB_URL = env.MONGODB_URL;
  }
}

let _env: EnvConfig;

try {
  _env = new EnvConfig();
} catch (e: unknown) {
  console.error("❌ Variáveis de Ambiente Inválidas");
  if (e instanceof Error) {
    console.error(`🔴 ${e.message}`);
  }
  process.exit(1);
}

export const env = _env;
