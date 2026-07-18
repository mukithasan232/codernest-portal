import { UserRole } from "@prisma/client"
import NextAuth, { DefaultSession, DefaultUser } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole | string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    id: string
    role: UserRole | string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string
    role?: UserRole | string
  }
}
