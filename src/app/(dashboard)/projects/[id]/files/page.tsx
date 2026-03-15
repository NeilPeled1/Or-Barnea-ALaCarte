import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessProject } from "@/lib/auth-utils";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

export default async function ProjectFilesPage({
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

  const files = await prisma.file.findMany({
    where: { projectId: id },
    include: { uploadedBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Files</h2>

      {files.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No files uploaded yet. File uploads require S3 configuration.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-2">
              {files.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium hover:underline"
                    >
                      {f.name}
                    </a>
                    <p className="text-sm text-muted-foreground">
                      {f.uploadedBy?.name} · {new Date(f.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
