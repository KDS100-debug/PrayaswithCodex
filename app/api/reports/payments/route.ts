import { NextResponse } from "next/server";
import { getSchoolPaymentSummary } from "@/server/reports/payment-reports";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const schoolId = url.searchParams.get("schoolId") ?? undefined;
  const report = await getSchoolPaymentSummary(schoolId);
  return NextResponse.json({ report });
}
