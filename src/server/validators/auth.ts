import { z } from "zod";

export const registerSchema = z.discriminatedUnion("role", [
  z.object({
    role: z.literal("PUBLIC"),
    name: z.string().min(2),
    phone: z.string().min(8),
    email: z.string().email().optional(),
    address: z.string().min(5),
    password: z.string().min(8)
  }),
  z.object({
    role: z.literal("STUDENT"),
    name: z.string().min(2),
    fatherName: z.string().min(2),
    rollNumber: z.string().min(1),
    caste: z.string().min(1),
    schoolName: z.string().min(1),
    className: z.string().min(1),
    password: z.string().min(8)
  })
]);

export type RegisterInput = z.infer<typeof registerSchema>;
