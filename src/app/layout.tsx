import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { getSiteUrl } from "@/lib/site-url";

const fontBody = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"]
});

const fontMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"]
});

export const metadata: Metadata = {
  title: "OpenWatch OSINT Tools",
  description: "Catalog-first OSINT website for searching public-source tools, then pivoting into maps, alerts, webcams, and workspace monitoring.",
  applicationName: "OpenWatch OSINT Tools",
  metadataBase: new URL(getSiteUrl()),
  alternates: {
    canonical: "/"
  },
  keywords: ["OSINT", "Open Source Intelligence", "tools", "webcams", "alerts", "maps", "investigation"],
  category: "technology",
  authors: [{ name: "Luken" }],
  creator: "Luken",
  publisher: "Luken",
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    title: "OpenWatch OSINT Tools",
    description: "Search the OSINT stack, then pivot into maps, alerts, webcams, and workspace monitoring.",
    url: "/",
    siteName: "OpenWatch OSINT Tools",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenWatch OSINT Tools",
    description: "Search the OSINT stack, then pivot into maps, alerts, webcams, and workspace monitoring."
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontBody.variable} ${fontMono.variable} font-sans`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
