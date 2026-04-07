import { PaymentChannel, PaymentKind, PaymentStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { razorpay, verifyRazorpaySignature } from "@/server/payments/razorpay";

export async function createRazorpayOrder(input: {
  userId: string;
  schoolId?: string;
  amount: number;
  kind: PaymentKind;
  invoiceId?: string;
  idempotencyKey: string;
}) {
  const existing = await prisma.payment.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
  if (existing?.razorpayOrderId) {
    return existing;
  }

  const amountPaise = Math.round(input.amount * 100);
  const order = await razorpay.orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt: `rcpt_${Date.now()}`,
    notes: {
      userId: input.userId,
      kind: input.kind
    }
  });

  return prisma.payment.upsert({
    where: { idempotencyKey: input.idempotencyKey },
    update: {
      gateway: "RAZORPAY",
      razorpayOrderId: order.id,
      amount: new Prisma.Decimal(input.amount)
    },
    create: {
      userId: input.userId,
      schoolId: input.schoolId,
      invoiceId: input.invoiceId,
      kind: input.kind,
      channel: PaymentChannel.ONLINE,
      status: PaymentStatus.PENDING,
      amount: new Prisma.Decimal(input.amount),
      gateway: "RAZORPAY",
      razorpayOrderId: order.id,
      idempotencyKey: input.idempotencyKey
    }
  });
}

export async function verifyAndCapturePayment(input: {
  paymentDbId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  receiptPdfUrl?: string;
}) {
  const valid = verifyRazorpaySignature(input.razorpayOrderId, input.razorpayPaymentId, input.razorpaySignature);
  if (!valid) {
    await prisma.payment.update({ where: { id: input.paymentDbId }, data: { status: PaymentStatus.FAILED } });
    throw new Error("Invalid Razorpay signature");
  }

  const payment = await prisma.payment.update({
    where: { id: input.paymentDbId },
    data: {
      status: PaymentStatus.PAID,
      razorpayOrderId: input.razorpayOrderId,
      razorpayPaymentId: input.razorpayPaymentId,
      razorpaySignature: input.razorpaySignature,
      reconciledAt: new Date()
    }
  });

  if (input.receiptPdfUrl) {
    await prisma.paymentReceipt.upsert({
      where: { paymentId: payment.id },
      update: { receiptPdfUrl: input.receiptPdfUrl },
      create: {
        paymentId: payment.id,
        userId: payment.userId,
        receiptPdfUrl: input.receiptPdfUrl
      }
    });
  }

  return payment;
}

export async function createOfflinePaymentEntry(input: {
  userId: string;
  studentId: string;
  schoolId: string;
  amount: number;
  feeType: string;
  paymentMode: string;
  receivedBy: string;
  receiptNumber: string;
  remarks?: string;
  transactionNumber?: string;
}) {
  const payment = await prisma.payment.create({
    data: {
      userId: input.userId,
      schoolId: input.schoolId,
      amount: new Prisma.Decimal(input.amount),
      kind: PaymentKind.FEE,
      channel: PaymentChannel.OFFLINE,
      status: PaymentStatus.VERIFIED
    }
  });

  return prisma.offlinePaymentEntry.create({
    data: {
      paymentId: payment.id,
      studentId: input.studentId,
      feeType: input.feeType,
      paymentMode: input.paymentMode,
      receivedBy: input.receivedBy,
      receiptNumber: input.receiptNumber,
      remarks: input.remarks,
      transactionNumber: input.transactionNumber,
      createdByUserId: input.userId,
      status: PaymentStatus.VERIFIED
    }
  });
}

export function getAllUserReceipts(userId: string) {
  return prisma.paymentReceipt.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });
}
