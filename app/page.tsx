import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const publications = await prisma.publication.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 10
  });

  return (
    <main>
      <h1>Prayas Multi-School Platform</h1>
      <p>Unified operations for School A, School B and School C.</p>
      <h2>Approved Publications</h2>
      {publications.length === 0 ? <p>No approved publications yet.</p> : null}
      <ul>
        {publications.map((p) => (
          <li key={p.id}>{p.title} by {p.author} ({p.category})</li>
        ))}
      </ul>
    </main>
  );
}
