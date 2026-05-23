import { ObjectId } from "mongodb";
import { AppError, ValidationError } from "./errors";

export function parseObjectId(value: string, label: string): ObjectId {
  if (!ObjectId.isValid(value)) {
    throw new ValidationError(`${label} inválido`);
  }

  return new ObjectId(value);
}

export function requireNonEmpty(value: string, label: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new ValidationError(`${label} é obrigatório`);
  }

  return normalized;
}

export function requirePositiveInteger(value: number, label: string): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new ValidationError(`${label} deve ser um inteiro positivo`);
  }

  return value;
}

export function handleError(error: unknown): void {
  if (error instanceof AppError) {
    console.error(`❌ ${error.message}`);
    return;
  }

  if (error instanceof Error) {
    console.error(`❌ Erro inesperado: ${error.message}`);
    return;
  }

  console.error("❌ Erro inesperado.");
}

export function formatDate(value: Date | undefined): string {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("pt-BR");
}
