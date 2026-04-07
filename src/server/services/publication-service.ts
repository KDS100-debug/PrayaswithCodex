import { prisma } from "@/lib/prisma";

export async function createPublication(data: {
  userId: string;
  title: string;
  author: string;
  category: string;
  abstract: string;
  fileUrl: string;
  images?: string[];
}) {
  return prisma.publication.create({
    data: {
      ...data,
      images: data.images ?? []
    }
  });
}

export function listApprovedPublications() {
  return prisma.publication.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" }
  });
}
