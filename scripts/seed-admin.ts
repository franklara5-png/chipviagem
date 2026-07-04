import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";
import { hashPassword } from "../src/lib/auth";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("Defina ADMIN_EMAIL e ADMIN_PASSWORD no .env");
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);

  const existing = await db
    .select()
    .from(schema.adminUsers)
    .where(eq(schema.adminUsers.email, email))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(schema.adminUsers)
      .set({ passwordHash })
      .where(eq(schema.adminUsers.email, email));
    console.log(`✓ Admin atualizado: ${email}`);
  } else {
    await db.insert(schema.adminUsers).values({ email, passwordHash });
    console.log(`✓ Admin criado: ${email}`);
  }
}

seedAdmin().catch((err) => {
  console.error("Erro:", err);
  process.exit(1);
});
