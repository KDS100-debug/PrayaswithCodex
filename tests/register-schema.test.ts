import { describe, expect, it } from "vitest";
import { registerSchema } from "../src/server/validators/auth";

describe("registerSchema", () => {
  it("accepts PUBLIC payload", () => {
    const result = registerSchema.safeParse({
      role: "PUBLIC",
      name: "Public User",
      phone: "9876543210",
      email: "public@example.com",
      address: "Some Area",
      password: "Public@123"
    });

    expect(result.success).toBe(true);
  });

  it("accepts STUDENT payload", () => {
    const result = registerSchema.safeParse({
      role: "STUDENT",
      name: "Student User",
      fatherName: "Father",
      rollNumber: "R-1",
      caste: "General",
      schoolName: "School A",
      className: "10",
      password: "Student@123"
    });

    expect(result.success).toBe(true);
  });
});
