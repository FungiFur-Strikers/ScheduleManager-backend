import { compare, hash } from "bcryptjs";

const DEFAULT_SALT_ROUNDS = 10;

export async function hashPassword(
  password: string,
  saltRounds: number = DEFAULT_SALT_ROUNDS
): Promise<string> {
  return await hash(password, saltRounds);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await compare(password, hashedPassword);
}
