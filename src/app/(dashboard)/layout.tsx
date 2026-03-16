import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { Providers } from "@/components/providers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session;
  try {
    session = await auth();
  } catch {
    redirect("/login");
  }
  if (!session?.user) redirect("/login");

  return (
    <Providers>
      <div className="flex min-h-screen flex-col lg:flex-row">
        <AppSidebar />
        <main className="min-h-screen flex-1 overflow-auto bg-background p-4 sm:p-6">
          {children}
        </main>
      </div>
    </Providers>
  );
}
