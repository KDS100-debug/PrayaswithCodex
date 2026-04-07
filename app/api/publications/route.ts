import { NextResponse } from "next/server";
import { z } from "zod";
import { createPublication, listApprovedPublications } from "@/server/services/publication-service";

const createSchema = z.object({
  userId: z.string(),
  title: z.string(),
  author: z.string(),
  category: z.string(),
  abstract: z.string(),
  fileUrl: z.string(),
  images: z.array(z.string()).optional()
});

export async function GET() {
  const items = await listApprovedPublications();
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const publication = await createPublication(parsed.data);
  return NextResponse.json({ publication }, { status: 201 });
}
