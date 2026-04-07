import { PrismaClient, UserRole } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.upsert({
    where: { id: "org_main" },
    update: {},
    create: { id: "org_main", name: "Prayas Education Group" }
  });

  const schools = await Promise.all([
    prisma.school.upsert({
      where: { slug: "school-a" },
      update: {},
      create: { slug: "school-a", name: "School A", address: "City A", organizationId: org.id }
    }),
    prisma.school.upsert({
      where: { slug: "school-b" },
      update: {},
      create: { slug: "school-b", name: "School B", address: "City B", organizationId: org.id }
    }),
    prisma.school.upsert({
      where: { slug: "school-c" },
      update: {},
      create: { slug: "school-c", name: "School C", address: "City C", organizationId: org.id }
    })
  ]);

  await prisma.user.upsert({
    where: { email: "superadmin@demo.local" },
    update: {},
    create: {
      name: "Super Admin",
      email: "superadmin@demo.local",
      passwordHash: hashSync("SuperAdmin@123", 10),
      role: UserRole.SUPER_ADMIN
    }
  });

  for (const [index, school] of schools.entries()) {
    await prisma.user.upsert({
      where: { email: `admin${index + 1}@demo.local` },
      update: {},
      create: {
        schoolId: school.id,
        name: `School ${index + 1} Admin`,
        email: `admin${index + 1}@demo.local`,
        passwordHash: hashSync("Admin@123", 10),
        role: UserRole.SCHOOL_ADMIN
      }
    });
  }
}

main().finally(async () => prisma.$disconnect());
