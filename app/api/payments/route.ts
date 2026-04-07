import { NextResponse } from "next/server";
import { z } from "zod";
import { createPaymentReceipt, getAllUserReceipts } from "@/server/services/payment-service";

const createSchema = z.object({
  userId: z.string().min(1),
  amount: z.number().positive(),
  receiptPdfUrl: z.string().url()
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const receipts = await getAllUserReceipts(userId);
  return NextResponse.json({ receipts });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const receipt = await createPaymentReceipt(parsed.data.userId, parsed.data.amount, parsed.data.receiptPdfUrl);
  return NextResponse.json({ receipt }, { status: 201 });
}
