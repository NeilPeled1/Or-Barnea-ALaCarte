import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessProject } from "@/lib/auth-utils";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ProjectNav } from "./project-nav";
import { SHEFFIELD_PROJECT_ID, SHEFFIELD_PROJECT_NAME, SHEFFIELD_ORG_NAME } from "@/data/sheffield-project";
import { ESTHER_PROJECT_ID, ESTHER_PROJECT_NAME, ESTHER_ORG_NAME } from "@/data/esther-project";

const STATIC_PROJECTS: Record<string, { name: string; org: string }> = {
  [SHEFFIELD_PROJECT_ID]: { name: SHEFFIELD_PROJECT_NAME, org: SHEFFIELD_ORG_NAME },
  [ESTHER_PROJECT_ID]: { name: ESTHER_PROJECT_NAME, org: ESTHER_ORG_NAME },
};

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

  const staticProj = STATIC_PROJECTS[id];
  if (staticProj) {
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
          <h1 className="mt-1 text-2xl font-bold">{staticProj.name}</h1>
          <p className="text-muted-foreground">{staticProj.org}</p>
        </div>
        <ProjectNav base={base} isStaticProject />
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
