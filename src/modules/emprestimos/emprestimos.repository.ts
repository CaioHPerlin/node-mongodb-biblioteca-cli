import { type ClientSession, Collection, ObjectId } from "mongodb";
import type {
  Emprestimo,
  EmprestimoDocument,
  EmprestimoStatus,
} from "./entities/emprestimo";

export class EmprestimosRepository {
  constructor(private readonly collection: Collection<Emprestimo>) {}

  async findAll(): Promise<EmprestimoDocument[]> {
    return this.collection.find().toArray();
  }

  async findById(
    id: ObjectId,
    session?: ClientSession,
  ): Promise<EmprestimoDocument | null> {
    return this.collection.findOne({ _id: id }, { session });
  }

  async findActive(): Promise<EmprestimoDocument[]> {
    return this.collection.find({ status: "ativo" }).toArray();
  }

  async findOverdue(now: Date): Promise<EmprestimoDocument[]> {
    return this.collection
      .find({
        status: "ativo",
        data_devolucao_prevista: { $lt: now },
      })
      .toArray();
  }

  async create(
    data: Emprestimo,
    session?: ClientSession,
  ): Promise<EmprestimoDocument> {
    const result = await this.collection.insertOne(data, { session });
    return { _id: result.insertedId, ...data };
  }

  async updateStatus(
    id: ObjectId,
    status: EmprestimoStatus,
    extra?: Partial<Emprestimo>,
    session?: ClientSession,
  ): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: id },
      { $set: { status, ...extra } },
      { session },
    );
    return result.modifiedCount === 1;
  }
}
