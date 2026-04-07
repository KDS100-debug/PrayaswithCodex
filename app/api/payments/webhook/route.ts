import { NextResponse } from "next/server";
import { PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/server/payments/razorpay";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as { event: string; payload?: { payment?: { entity?: { id?: string } } } };
  const paymentId = event.payload?.payment?.entity?.id;
  if (!paymentId) return NextResponse.json({ ok: true });

  if (event.event === "payment.captured") {
    await prisma.payment.updateMany({
      where: { razorpayPaymentId: paymentId },
      data: { status: PaymentStatus.PAID, reconciledAt: new Date() }
    });
  }

  if (event.event === "payment.failed") {
    await prisma.payment.updateMany({
      where: { razorpayPaymentId: paymentId },
      data: { status: PaymentStatus.FAILED }
    });
  }

  return NextResponse.json({ ok: true });
}
