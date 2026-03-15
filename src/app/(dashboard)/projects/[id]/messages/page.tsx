import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessProject } from "@/lib/auth-utils";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { MessageForm } from "./message-form";

export default async function ProjectMessagesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { organization: true },
  });
  if (!project || !canAccessProject(session, project.organizationId)) {
    notFound();
  }

  const messages = await prisma.message.findMany({
    where: { projectId: id },
    include: { author: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Messages</h2>

      <Card>
        <CardContent className="pt-4">
          <div className="space-y-4">
            {messages.map((m) => (
              <div key={m.id} className="rounded-lg border p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {m.author.name ?? m.author.email}
                  </span>
                  <span>{new Date(m.createdAt).toLocaleString()}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap">{m.content}</p>
              </div>
            ))}
          </div>
          <MessageForm projectId={id} />
        </CardContent>
      </Card>
    </div>
  );
}
