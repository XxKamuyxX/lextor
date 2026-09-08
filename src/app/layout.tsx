import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
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
        className={`${inter.variable} ${playfairDisplay.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
