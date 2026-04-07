import { PaymentChannel, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getSchoolPaymentSummary(schoolId?: string) {
  const where = schoolId ? { schoolId } : {};

  const [online, offline, pending, failed] = await Promise.all([
    prisma.payment.aggregate({
      where: { ...where, channel: PaymentChannel.ONLINE, status: PaymentStatus.PAID },
      _sum: { amount: true }
    }),
    prisma.payment.aggregate({
      where: { ...where, channel: PaymentChannel.OFFLINE },
      _sum: { amount: true }
    }),
    prisma.payment.count({ where: { ...where, status: PaymentStatus.PENDING } }),
    prisma.payment.count({ where: { ...where, status: PaymentStatus.FAILED } })
  ]);

  return {
    onlineCollected: online._sum.amount ?? 0,
    offlineCollected: offline._sum.amount ?? 0,
    pendingCount: pending,
    failedCount: failed
  };
}
