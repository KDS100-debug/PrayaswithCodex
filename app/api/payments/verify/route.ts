import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAndCapturePayment } from "@/server/services/payment-service";

const schema = z.object({
  paymentDbId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
  receiptPdfUrl: z.string().url().optional()
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const payment = await verifyAndCapturePayment(parsed.data);
    return NextResponse.json({ payment });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
