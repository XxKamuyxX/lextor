import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { RegisterServiceWorker } from "@/components/landing/RegisterServiceWorker";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "LEXTOR | Consultoria Patrimonial Exclusiva",
    template: "%s | LEXTOR",
  },
  description:
    "Consultoria patrimonial exclusiva e sem conflito de interesses. Protegemos e multiplicamos o patrimônio construído pelo seu trabalho.",
  metadataBase: new URL("https://alexjdantas.com"),
  manifest: "/manifest.json",
  applicationName: "LEXTOR",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LEXTOR",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  openGraph: {
    title: "LEXTOR | Consultoria Patrimonial Exclusiva",
    description:
      "O seu trabalho constrói a sua riqueza. A LEXTOR protege e multiplica o seu patrimônio.",
    siteName: "LEXTOR",
    locale: "pt_BR",
    type: "website",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="LEXTOR" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body
        className={`${inter.variable} ${playfairDisplay.variable} antialiased`}
      >
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
