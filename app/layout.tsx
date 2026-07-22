import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/use-auth";
import { ServiceWorkerRegister } from "@/components/dashboard/ServiceWorkerRegister";
import "../styles/globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0F62FE",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "ResQNet AI",
    template: "%s | ResQNet AI",
  },
  description:
    "AI-Powered Disaster Response & Resource Coordination Platform. Real-time incident tracking, resource allocation, and volunteer management.",
  keywords: [
    "disaster response",
    "emergency management",
    "AI coordination",
    "resource allocation",
    "volunteer management",
    "incident tracking",
    "humanitarian aid",
  ],
  authors: [{ name: "ResQNet Team" }],
  creator: "ResQNet AI",
  publisher: "ResQNet AI",
  robots: "index, follow",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://resqnet.ai",
    siteName: "ResQNet AI",
    title: "ResQNet AI",
    description:
      "AI-Powered Disaster Response & Resource Coordination Platform",
  },
  twitter: {
    card: "summary_large_image",
    title: "ResQNet AI",
    description:
      "AI-Powered Disaster Response & Resource Coordination Platform",
  },
  appleWebApp: {
    capable: true,
    title: "ResQNet AI",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="flex min-h-full flex-col">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
