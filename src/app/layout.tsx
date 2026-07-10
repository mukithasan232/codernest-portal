import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data } = await supabase.from('global_settings').select('site_name, favicon_url').eq('id', 1).single();

  const siteName = data?.site_name || "CoderNest";
  const title = `${siteName} | B2B Tech Agency & Image Processing SaaS`;

  return {
    title,
    description: "Elite B2B software agency and AI-powered image processing SaaS. Web development, SaaS builds, creative image studio, and client portal.",
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://codernest.agency"),
    icons: data?.favicon_url ? { icon: data.favicon_url } : undefined,
    openGraph: {
      title,
      description: "Elite software agency + AI image studio. Build faster, look better.",
      type: "website",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data } = await supabase.from('global_settings').select('primary_color').eq('id', 1).single();
  const primaryColor = data?.primary_color || '#3B82F6';

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --primary: ${primaryColor};
          }
          /* Override Tailwind primary color utilities by injecting a CSS variable into the root */
          .bg-blue-500 { background-color: var(--primary) !important; }
          .bg-blue-600 { background-color: var(--primary) !important; filter: brightness(0.9); }
          .text-blue-500 { color: var(--primary) !important; }
          .text-blue-400 { color: var(--primary) !important; filter: brightness(1.1); }
          .border-blue-500 { border-color: var(--primary) !important; }
          .ring-blue-500 { --tw-ring-color: var(--primary) !important; }
          .from-\\[\\#3B82F6\\] { --tw-gradient-from: var(--primary) !important; }
          .to-\\[\\#3B82F6\\] { --tw-gradient-to: var(--primary) !important; }
        `}} />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-[#030712] dark:text-white antialiased transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* AuthProvider wraps everything — provides auth state to all client components */}
          <AuthProvider>
            {children}
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
        </ThemeProvider>
      </body>
    </html>
  );
}
