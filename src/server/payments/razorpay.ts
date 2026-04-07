import crypto from "crypto";
import Razorpay from "razorpay";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  throw new Error("Razorpay keys are missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
}

export const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret
});

export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string) {
  const body = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac("sha256", keySecret!).update(body).digest("hex");
  return expected === signature;
}

export function verifyWebhookSignature(rawBody: string, receivedSignature?: string | null) {
  if (!receivedSignature || !process.env.RAZORPAY_WEBHOOK_SECRET) return false;
  const digest = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(receivedSignature));
}
