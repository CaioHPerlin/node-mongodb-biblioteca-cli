import { MongoClient } from "mongodb";
import { env } from "./config";

const client = new MongoClient(env.MONGODB_URL);
export const db = client.db("biblioteca");

export const connectDB = async (): Promise<void> => {
  try {
    await client.connect();
    await db.command({ ping: 1 });
  } catch (error: unknown) {
    console.error("❌ Falha na Conexão com o Banco de Dados");
    if (error instanceof Error) {
      console.error(`🔴 ${error.message}`);
    }
    process.exit(1);
  }
};

export const closeDB = () => client.close();
