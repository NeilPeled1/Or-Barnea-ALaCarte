import Image from "next/image";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  let session;
  try {
    session = await auth();
  } catch {
    // Auth config error - show landing
  }
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted/30">
      <Image
        src="/logo.png"
        alt="À La Carte - Professional Culinary Consulting"
        width={280}
        height={100}
        priority
        className="object-contain"
      />
      <p className="text-muted-foreground">
        Culinary consulting platform for restaurants
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/login">Sign in</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/register">Register</Link>
        </Button>
      </div>
    </div>
  );
}
