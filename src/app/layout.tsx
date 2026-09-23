import { Suspense } from "react";
import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import MetaPixel from "@/components/MetaPixel";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import { getCachedSystemSettings } from "@/lib/cache/cached-queries";

// Incremental Static Regeneration (ISR) - Cache on global Edge CDN for 24h (stale-while-revalidate)
export const revalidate = 86400;

const inter = Inter({ subsets: ["latin"], variable: '--font-inter', display: 'swap' });
const outfit = Outfit({ subsets: ["latin"], variable: '--font-outfit', display: 'swap' });

export async function generateMetadata(): Promise<Metadata> {
  const data = await getCachedSystemSettings();

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
  const data = await getCachedSystemSettings();
  const primaryColor = data?.brandColor || '#3B82F6';
  const secondaryColor = data?.secondaryColor || '#00F2FE';


  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning style={{ '--primary': primaryColor, '--secondary': secondaryColor } as React.CSSProperties}>
      <head>
        {data?.customHeaderScripts && (
          <script dangerouslySetInnerHTML={{ __html: data.customHeaderScripts }} />
        )}
        <meta name="impact-site-verification" content="25cd8034-8d91-4d43-ac56-e4b692ee4474" value="25cd8034-8d91-4d43-ac56-e4b692ee4474" />
        {/* GA4 is handled by <GoogleAnalytics /> in the body — no inline init needed here */}


      
        <Script
          id="organization-json-ld"
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
            {/* GA4 universal route tracker */}
            <GoogleAnalytics />
            <Suspense fallback={null}>
              <MetaPixel />
            </Suspense>
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
        <Analytics />
        <SpeedInsights />
        <Script
          id="impact-publisher-tag"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(i,m,p,a,c,t){c.ire_o=p;c[p]=c[p]||function(){(c[p].a=c[p].a||[]).push(arguments)};t=a.createElement(m);var z=a.getElementsByTagName(m)[0];t.async=1;t.src=i;z.parentNode.insertBefore(t,z)})('https://utt.impactcdn.com/P-A6729363-1e63-4def-934f-f6455e6ec8301.js','script','impactStat',document,window);impactStat('trackImpression');`
          }}
        />
      </body>
    </html>
  );
}
