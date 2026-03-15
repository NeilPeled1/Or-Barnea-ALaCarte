import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
declare module "next-auth" {
  interface User {
    role: string;
    organizationId?: string | null;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: string;
      organizationId?: string | null;
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "demo-secret-replace-in-production",
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Demo mode: works without database for easy sharing
        const demoUsers = [
          { email: "admin@alacarte.com", password: "admin123", name: "Admin", role: "ADMIN" as const },
          { email: "client@bistro.com", password: "admin123", name: "Client", role: "CLIENT" as const },
        ];
        const demo = demoUsers.find(
          (u) => u.email === credentials.email && u.password === credentials.password
        );
        if (demo) {
          return { id: `demo-${demo.role.toLowerCase()}`, email: demo.email, name: demo.name, role: demo.role, organizationId: null };
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });
          if (!user || !user.password) return null;
          const valid = await bcrypt.compare(credentials.password as string, user.password);
          if (!valid) return null;
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            organizationId: user.organizationId,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as { role?: string; organizationId?: string | null }).role = user.role;
        (token as { role?: string; organizationId?: string | null }).organizationId = user.organizationId;
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = (token as { role?: string }).role ?? "CLIENT";
        session.user.organizationId = (token as { organizationId?: string | null }).organizationId ?? null;
      }
      return session;
    },
  },
});
