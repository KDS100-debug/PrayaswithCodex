import { PaymentChannel, PaymentKind, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function createPaymentReceipt(userId: string, amount: number, receiptPdfUrl: string) {
  const payment = await prisma.payment.create({
    data: {
      userId,
      kind: PaymentKind.FEE,
      channel: PaymentChannel.ONLINE,
      status: PaymentStatus.PAID,
      amount
    }
  });

  return prisma.paymentReceipt.create({
    data: {
      paymentId: payment.id,
      userId,
      receiptPdfUrl
    }
  });
}

export function getAllUserReceipts(userId: string) {
  return prisma.paymentReceipt.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });
}
