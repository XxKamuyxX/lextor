import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
  openGraph: {
    title: "LEXTOR | Consultoria Patrimonial Exclusiva",
    description:
      "O seu trabalho constrói a sua riqueza. A LEXTOR protege e multiplica o seu patrimônio.",
    siteName: "LEXTOR",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
