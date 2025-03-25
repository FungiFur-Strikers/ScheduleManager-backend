import { DrizzleD1Database } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { users } from "../../schema";
import { User } from "@project/shared/schemas";
import { hashPassword } from "./password";

export class UserService {
  constructor(private db: DrizzleD1Database) {}

  async findUserById(userId: number): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.userId, userId));
    return user || null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user || null;
  }

  async createUser(data: {
    username: string;
    email: string;
    password: string;
    saltRounds: number;
  }): Promise<User> {
    const hashedPassword = await hashPassword(data.password, data.saltRounds);
    const result = await this.db.insert(users).values({
      username: data.username,
      email: data.email,
      password: hashedPassword,
      updateTime: new Date().toISOString(),
      updateUserId: 1,
      createTime: new Date().toISOString(),
      createUserId: 1,
    });

    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.userId, result.meta.last_row_id));

    return user;
  }

  async updateUser(
    userId: number,
    data: {
      username: string;
      email: string;
      password?: string;
      saltRounds?: number;
    }
  ): Promise<User> {
    const updateData: Partial<User> = {
      username: data.username,
      email: data.email,
      updateTime: new Date().toISOString(),
      updateUserId: userId,
    };

    if (data.password && data.saltRounds) {
      updateData.password = await hashPassword(data.password, data.saltRounds);
    }

    const [updatedUser] = await this.db
      .update(users)
      .set(updateData)
      .where(eq(users.userId, userId))
      .returning();

    return updatedUser;
  }
}
