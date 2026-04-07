import { NextResponse } from "next/server";
import { z } from "zod";
import { createOfflinePaymentEntry } from "@/server/services/payment-service";

const schema = z.object({
  userId: z.string(),
  studentId: z.string(),
  schoolId: z.string(),
  amount: z.number().positive(),
  feeType: z.string(),
  paymentMode: z.string(),
  receivedBy: z.string(),
  receiptNumber: z.string(),
  remarks: z.string().optional(),
  transactionNumber: z.string().optional()
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const entry = await createOfflinePaymentEntry(parsed.data);
  return NextResponse.json({ entry }, { status: 201 });
}
