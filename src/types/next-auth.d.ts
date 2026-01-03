import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      companyId: string;
      loginId: string | null;
      companyLogo: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: "EMPLOYEE" | "HR";
    companyId: string;
    loginId: string | null;
    companyLogo: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: "EMPLOYEE" | "HR";
    companyId: string;
    loginId: string | null;
    companyLogo: string;
  }
}
