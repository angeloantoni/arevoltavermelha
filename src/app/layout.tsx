import type { Metadata } from "next";
import { Archivo_Black, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "A Revolta Vermelha — Revista Política",
  description:
    "Revista marxista-leninista de teoria, análise política, traduções inéditas e memória histórica do Levante Popular de 1935 em Natal/RN.",
  keywords: [
    "A Revolta Vermelha",
    "Revista Política",
    "Levante de 1935",
    "Natal RN",
    "Marxismo-Leninismo",
    "Comitê Popular Revolucionário",
    "Traduções",
  ],
  authors: [{ name: "Conselho Editorial A Revolta Vermelha" }],
  icons: {
    icon: "/icone_vermelho.webp",
    shortcut: "/icone_vermelho.webp",
    apple: "/icone_vermelho.webp",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${archivoBlack.variable} ${ibmPlexMono.variable}`}>
      <body className="bg-rev-white text-rev-black font-mono antialiased min-h-screen flex flex-col selection:bg-rev-red selection:text-white">
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

