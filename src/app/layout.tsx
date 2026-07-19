import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { prisma } from '@/lib/prisma';

// Force all pages to render dynamically — the root layout fetches from MongoDB
// at request time, so SSG/ISR would fail when the DB is unreachable at build time.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const outfit = Outfit({ subsets: ["latin"], variable: '--font-outfit' });

export async function generateMetadata(): Promise<Metadata> {
  let data = null;
  try {
    data = await prisma.systemSettings.findUnique({ where: { id: 'global_settings' }, select: { siteName: true, siteTitle: true, faviconUrl: true } });
  } catch {
    // DB unreachable — use defaults
  }

  const siteName = data?.siteName || "CoderNest";
  const title = data?.siteTitle ? `${siteName} | ${data.siteTitle}` : `${siteName} | B2B Tech Agency & Image Processing SaaS`;

  return {
    title,
    description: "Elite B2B software agency and AI-powered image processing SaaS. Web development, SaaS builds, creative image studio, and client portal.",
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://codernest.agency"),
    icons: data?.faviconUrl ? { icon: data.faviconUrl } : undefined,
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
  let data = null;
  try {
    data = await prisma.systemSettings.findUnique({ where: { id: 'global_settings' } });
  } catch {
    // DB unreachable — use defaults
  }
  const primaryColor = data?.brandColor || '#3B82F6';
  const secondaryColor = data?.secondaryColor || '#00F2FE';

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning style={{ '--primary': primaryColor, '--secondary': secondaryColor } as React.CSSProperties}>
      <head>
        {data?.customHeaderScripts && (
          <script dangerouslySetInnerHTML={{ __html: data.customHeaderScripts }} />
        )}
        {data?.googleAnalyticsId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${data.googleAnalyticsId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${data.googleAnalyticsId}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}

        {data?.facebookPixelId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${data.facebookPixelId}');
                fbq('track', 'PageView');
              `,
            }}
          />
        )}
      
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: data?.siteName || "CoderNest",
              url: process.env.NEXT_PUBLIC_APP_URL || "https://codernest.agency",
              logo: data?.logoUrl || undefined,
              contactPoint: data?.primaryEmail ? {
                "@type": "ContactPoint",
                email: data.primaryEmail,
                contactType: "customer service"
              } : undefined
            })
          }}
        />
      </head>
      <body>
        {/* Mukit AI Global Chatbot Placeholder */}
        <div id="mukit-ai-placeholder"></div>

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
        {data?.customFooterScripts && (
          <script dangerouslySetInnerHTML={{ __html: data.customFooterScripts }} />
        )}
      </body>
    </html>
  );
}
