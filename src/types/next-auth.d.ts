import { Role } from "@prisma/client"
import NextAuth, { DefaultSession, DefaultUser } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role | string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    id: string
    role: Role | string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string
    role?: Role | string
  }
}
