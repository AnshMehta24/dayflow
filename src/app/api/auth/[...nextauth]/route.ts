import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Login ID" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.identifier || !credentials.password) return null;

        let user;

        if (credentials.identifier.includes("@")) {
          user = await prisma.user.findUnique({
            where: { email: credentials.identifier },
          });
        } else {
          user = await prisma.user.findFirst({
            where: { loginId: credentials.identifier },
          });
        }

        if (!user) return null;

        const company = await prisma.company.findFirst({
          where: { id: user.companyId },
        });

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
          loginId: user.loginId,
          companyLogo: company?.companyLogo ?? null,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.companyId = user.companyId;
        token.loginId = user.loginId;
        token.companyLogo = user.companyLogo;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.companyId = token.companyId as string;
        session.user.loginId = token.loginId as string | null;
        session.user.companyLogo = token.companyLogo as string;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
