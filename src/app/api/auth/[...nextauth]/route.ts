import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        identifier: {},
        password: {},
      },

      async authorize(credentials) {
        if (!credentials?.identifier || !credentials.password) return null;

        console.log(credentials, "CRED");
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
          companyLogo: company?.companyLogo,
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
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.companyId = token.companyId;
        session.user.loginId = token.loginId;
        session.user.companyLogo = token.companyLogo;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
