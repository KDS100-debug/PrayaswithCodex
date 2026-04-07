import { UserRole } from "@prisma/client";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { RegisterInput } from "@/server/validators/auth";

export async function registerUser(payload: RegisterInput) {
  const passwordHash = await hash(payload.password, 10);

  if (payload.role === "PUBLIC") {
    return prisma.user.create({
      data: {
        role: UserRole.PUBLIC,
        name: payload.name,
        phone: payload.phone,
        email: payload.email,
        address: payload.address,
        passwordHash,
        fatherName: null,
        rollNumber: null,
        caste: null,
        className: null
      }
    });
  }

  const school = await prisma.school.findFirst({ where: { name: payload.schoolName } });

  return prisma.user.create({
    data: {
      schoolId: school?.id,
      role: UserRole.STUDENT,
      name: payload.name,
      fatherName: payload.fatherName,
      rollNumber: payload.rollNumber,
      caste: payload.caste,
      className: payload.className,
      passwordHash
    }
  });
}
