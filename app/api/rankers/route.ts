import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const schoolId = url.searchParams.get("schoolId") ?? undefined;

  const rankers = await prisma.ranker.findMany({
    where: schoolId ? { schoolId } : undefined,
    orderBy: [{ academicYear: "desc" }, { rankPosition: "asc" }]
  });

  return NextResponse.json({ rankers });
}

export async function POST(request: Request) {
  const body = await request.json();
  const ranker = await prisma.ranker.create({
    data: {
      schoolId: body.schoolId,
      academicYear: body.academicYear,
      className: body.className,
      rankPosition: body.rankPosition,
      studentName: body.studentName,
      score: body.score,
      updatedByUserId: body.updatedByUserId
    }
  });

  return NextResponse.json({ ranker }, { status: 201 });
}
