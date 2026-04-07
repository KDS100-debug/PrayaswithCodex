import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const schoolId = url.searchParams.get("schoolId") ?? undefined;
  const books = await prisma.book.findMany({
    where: schoolId ? { schoolId } : undefined,
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ books });
}

export async function POST(request: Request) {
  const body = await request.json();
  const book = await prisma.book.create({
    data: {
      schoolId: body.schoolId,
      title: body.title,
      author: body.author,
      price: body.price,
      available: body.available ?? true,
      coverImageUrl: body.coverImageUrl,
      pdfUrl: body.pdfUrl,
      tags: body.tags ?? [],
      description: body.description,
      stock: body.stock ?? 0
    }
  });

  return NextResponse.json({ book }, { status: 201 });
}
