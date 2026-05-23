import { Collection, ObjectId } from "mongodb";
import type { CreateLivroDto } from "./dto/create-livro.dto";
import type { Livro, LivroDocument } from "./entities/livro";

export class LivrosRepository {
  constructor(private readonly collection: Collection<Livro>) {}

  async findAll(): Promise<LivroDocument[]> {
    return this.collection.find().toArray();
  }

  async findById(id: ObjectId): Promise<LivroDocument | null> {
    return this.collection.findOne({ _id: id });
  }

  async create(data: CreateLivroDto): Promise<LivroDocument> {
    const livro: Livro = {
      ...data,
      quantidadeDisponivel: data.quantidadeTotal,
    };
    const result = await this.collection.insertOne(livro);
    return { _id: result.insertedId, ...livro };
  }

  async decrementAvailable(id: ObjectId): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: id, quantidadeDisponivel: { $gt: 0 } },
      { $inc: { quantidadeDisponivel: -1 } },
    );
    return result.modifiedCount === 1;
  }

  async incrementAvailable(id: ObjectId): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: id },
      { $inc: { quantidadeDisponivel: 1 } },
    );
    return result.modifiedCount === 1;
  }

  async delete(id: ObjectId): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }
}
