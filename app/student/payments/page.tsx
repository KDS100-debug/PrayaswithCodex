"use client";

import { useState } from "react";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

async function loadRazorpay() {
  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function StudentPaymentsPage() {
  const [status, setStatus] = useState<string>("");

  const startPayment = async () => {
    const loaded = await loadRazorpay();
    if (!loaded) {
      setStatus("Unable to load Razorpay checkout.");
      return;
    }

    const idempotencyKey = crypto.randomUUID();
    const createRes = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "demo-user-id",
        amount: 500,
        kind: "FEE",
        idempotencyKey
      })
    });

    const { payment } = await createRes.json();

    const rz = new window.Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: Number(payment.amount) * 100,
      currency: "INR",
      order_id: payment.razorpayOrderId,
      name: "Prayas School Group",
      description: "Fee Payment",
      handler: async (response: Record<string, string>) => {
        const verify = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentDbId: payment.id,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature
          })
        });

        if (verify.ok) setStatus("Payment successful and verified.");
        else setStatus("Payment received but verification failed.");
      }
    });

    rz.open();
  };

  return (
    <main>
      <h1>Student Fee Payments</h1>
      <p>Pay school fees securely with Razorpay.</p>
      <button onClick={startPayment}>Pay ₹500</button>
      {status ? <p>{status}</p> : null}
    </main>
  );
}
