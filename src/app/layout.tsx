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
    default: "ETR | Consultoria de Investimentos de Alto Padrão",
    template: "%s | ETR",
  },
  description:
    "Consultoria patrimonial institucional: planejamento, alocação estratégica, suitability e acompanhamento de carteira para investidores exigentes.",
  metadataBase: new URL("https://alexjdantas.com"),
  openGraph: {
    title: "ETR | Consultoria de Investimentos",
    description:
      "Patrimônio com visão institucional. Estratégia, governança e performance no longo prazo.",
    siteName: "ETR",
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
