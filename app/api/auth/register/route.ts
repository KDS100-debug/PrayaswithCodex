import { NextResponse } from "next/server";
import { registerSchema } from "@/server/validators/auth";
import { registerUser } from "@/server/services/auth-service";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const user = await registerUser(parsed.data);
  return NextResponse.json({ id: user.id, role: user.role });
}
