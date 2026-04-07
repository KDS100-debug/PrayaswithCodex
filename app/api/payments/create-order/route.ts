import { PaymentKind } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createRazorpayOrder } from "@/server/services/payment-service";

const schema = z.object({
  userId: z.string().min(1),
  schoolId: z.string().optional(),
  amount: z.number().positive(),
  kind: z.nativeEnum(PaymentKind),
  invoiceId: z.string().optional(),
  idempotencyKey: z.string().min(8)
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const payment = await createRazorpayOrder(parsed.data);
  return NextResponse.json({ payment });
}
