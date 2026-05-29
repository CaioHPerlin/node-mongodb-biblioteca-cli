import { type ClientSession, Collection, ObjectId } from "mongodb";
import type { CreateLivroDto } from "./dto/create-livro.dto";
import type { Livro, LivroDocument } from "./entities/livro";

export class LivrosRepository {
  constructor(private readonly collection: Collection<Livro>) {}

  async findAll(): Promise<LivroDocument[]> {
    return this.collection.find().toArray();
  }

  async findById(
    id: ObjectId,
    session?: ClientSession,
  ): Promise<LivroDocument | null> {
    return this.collection.findOne({ _id: id }, { session });
  }

  async create(data: CreateLivroDto): Promise<LivroDocument> {
    const livro: Livro = {
      ...data,
      exemplares_disponiveis: data.exemplares_total,
    };
    const result = await this.collection.insertOne(livro);
    return { _id: result.insertedId, ...livro };
  }

  async decrementAvailable(
    id: ObjectId,
    session?: ClientSession,
  ): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: id, exemplares_disponiveis: { $gt: 0 } },
      { $inc: { exemplares_disponiveis: -1 } },
      { session },
    );
    return result.modifiedCount === 1;
  }

  async incrementAvailable(
    id: ObjectId,
    session?: ClientSession,
  ): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: id },
      { $inc: { exemplares_disponiveis: 1 } },
      { session },
    );
    return result.modifiedCount === 1;
  }

  async delete(id: ObjectId): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }
}
