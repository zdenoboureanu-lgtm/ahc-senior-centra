import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Script from "next/script";
import { Toaster } from "sonner";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "@/common/providers/convex-client-provider";
import { getBranchSlugFromHeaders } from "@/common/lib/branch";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export async function generateMetadata(): Promise<Metadata> {
  const slug = await getBranchSlugFromHeaders();
  if (!slug) {
    return {
      title: "AHC – Senior centra",
      description: "Síť senior center AHC po celé České republice.",
    };
  }
  const branch = await fetchQuery(api.modules.branches.queries.getBySlug, {
    slug,
  }).catch(() => null);
  return {
    title: branch?.name ?? `AHC ${slug}`,
    description:
      branch?.subtitle ??
      branch?.description ??
      "Péče s respektem ke stáří.",
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="cs" className={montserrat.variable}>
        <head>
          <link rel="stylesheet" href="https://chat.kraita.io/chat/chatbot.css" />
        </head>
        <body className="min-h-full flex flex-col bg-background text-foreground">
          <ConvexClientProvider>
            {children}
            <Toaster richColors position="top-right" />
          </ConvexClientProvider>
          <Script id="chatbot-loader" strategy="afterInteractive">
            {`(function(){
              var s=document.createElement('script');
              s.src='https://chat.kraita.io/chat/chatbot.js';
              s.onload=function(){
                initChatbot({
                  apiKey:"cv_zHPWoqVRZTsqsGZeX9oqXWpVFecq7vWU",
                  chatWidgetId:"m17fk4589791p5gtdkgrsahy1x7ksr1t",
                });
              };
              document.body.appendChild(s);
            })();`}
          </Script>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
