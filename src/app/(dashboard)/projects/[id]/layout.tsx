import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessProject } from "@/lib/auth-utils";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ProjectNav } from "./project-nav";
import { SHEFFIELD_PROJECT_ID, SHEFFIELD_PROJECT_NAME, SHEFFIELD_ORG_NAME } from "@/data/sheffield-project";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  if (id === SHEFFIELD_PROJECT_ID) {
    const base = `/projects/${id}`;
    return (
      <div className="space-y-6">
        <div>
          <Link
            href="/projects"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to projects
          </Link>
          <h1 className="mt-1 text-2xl font-bold">{SHEFFIELD_PROJECT_NAME}</h1>
          <p className="text-muted-foreground">{SHEFFIELD_ORG_NAME}</p>
        </div>
        <ProjectNav base={base} isSheffield />
        {children}
      </div>
    );
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: { organization: true },
  });
  if (!project || !canAccessProject(session, project.organizationId)) {
    notFound();
  }

  const base = `/projects/${id}`;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/projects"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to projects
        </Link>
        <h1 className="mt-1 text-2xl font-bold">{project.name}</h1>
        <p className="text-muted-foreground">{project.organization.name}</p>
      </div>
      <ProjectNav base={base} />
      {children}
    </div>
  );
}
