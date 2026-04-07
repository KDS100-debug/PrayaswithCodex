import { NextResponse } from "next/server";
import { getAllUserReceipts } from "@/server/services/payment-service";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const receipts = await getAllUserReceipts(userId);
  return NextResponse.json({ receipts });
}
