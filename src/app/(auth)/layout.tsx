import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session;
  try {
    session = await auth();
  } catch {
    // Auth config error - show login form
  }
  if (session?.user) redirect("/dashboard");
  return <>{children}</>;
}
