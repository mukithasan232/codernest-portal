import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AIChatbot from "@/components/ui/AIChatbot";
import { AuthProvider } from "@/components/providers/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CoderNest | B2B Tech Agency & Image Processing SaaS",
  description:
    "CoderNest — Elite B2B software agency and AI-powered image processing SaaS. Web development, SaaS builds, creative image studio, and client portal.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://codernest.agency"
  ),
  openGraph: {
    title: "CoderNest | B2B Tech Agency & Image Processing SaaS",
    description:
      "Elite software agency + AI image studio. Build faster, look better.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        {/* AuthProvider wraps everything — provides auth state to all client components */}
        <AuthProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
          <AIChatbot />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#1e293b",
                color: "#f8fafc",
                border: "1px solid rgba(255,255,255,0.1)",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
