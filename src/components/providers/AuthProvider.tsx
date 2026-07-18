'use client';

import { SessionProvider, useSession, signOut } from "next-auth/react";
import { ReactNode } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}

// A helper hook to provide a similar interface to the old useAuth
export const useAuth = () => {
  const { data: session, status } = useSession();
  
  return {
    appUser: session?.user ? { ...session.user, displayName: session.user.name, photoURL: session.user.image } : null,
    loading: status === "loading",
    logOut: () => signOut({ callbackUrl: '/' })
  };
};
