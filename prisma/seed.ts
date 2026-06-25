import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Seed admin user dari env. Idempotent.
// Usage: npm run db:seed

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Admin";

  if (!email || !password) {
    console.error("Set ADMIN_EMAIL & ADMIN_PASSWORD di .env.local");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN", name },
    create: { email, name, passwordHash, role: "ADMIN" },
  });

  console.log(`Admin ready: ${admin.email} (${admin.role})`);

  // Seed sample project kalau kosong
  const projectCount = await prisma.project.count();
  if (projectCount === 0) {
    await prisma.project.create({
      data: {
        slug: "portfolio-website",
        title: "Portfolio Website",
        description: "Production-grade portfolio dengan 13-layer architecture.",
        content:
          "Stack: Next.js 14, Prisma, Neon Postgres, Auth.js, Upstash, Sentry.",
        tech: ["Next.js", "TypeScript", "PostgreSQL", "Tailwind"],
        published: true,
        publishedAt: new Date(),
        featured: true,
      },
    });
    console.log("Seeded 1 sample project");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
