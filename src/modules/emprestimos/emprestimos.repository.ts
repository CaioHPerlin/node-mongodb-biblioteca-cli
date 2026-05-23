import { Collection, ObjectId } from "mongodb";
import type { Emprestimo, EmprestimoDocument } from "./entities/emprestimo";

export class EmprestimosRepository {
  constructor(private readonly collection: Collection<Emprestimo>) {}

  async findAll(): Promise<EmprestimoDocument[]> {
    return this.collection.find().toArray();
  }

  async findById(id: ObjectId): Promise<EmprestimoDocument | null> {
    return this.collection.findOne({ _id: id });
  }

  async findActive(): Promise<EmprestimoDocument[]> {
    return this.collection
      .find({ dataDevolucaoReal: { $exists: false } })
      .toArray();
  }

  async create(data: Emprestimo): Promise<EmprestimoDocument> {
    const result = await this.collection.insertOne(data);
    return { _id: result.insertedId, ...data };
  }

  async markAsReturned(id: ObjectId, now: Date): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: id, dataDevolucaoReal: { $exists: false } },
      {
        $set: {
          dataDevolucaoReal: now,
        },
      },
    );
    return result.modifiedCount === 1;
  }
}
