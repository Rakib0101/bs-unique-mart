import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth";

async function main() {
  const username = process.env.SUPERADMIN_USERNAME;
  const password = process.env.SUPERADMIN_PASSWORD;
  if (!username || !password) {
    throw new Error("Set SUPERADMIN_USERNAME and SUPERADMIN_PASSWORD env vars before running.");
  }

  const db = getDb();

  await db
    .insert(users)
    .ignore()
    .values({
      username,
      passwordHash: await hashPassword(password),
      role: "admin",
      hidden: true,
    });

  console.log(`Ensured hidden superadmin "${username}" exists.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
