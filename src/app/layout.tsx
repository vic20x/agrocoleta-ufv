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
  title: "AgroColeta | Plataforma de Coleta & Inteligência Agronômica",
  description: "Sistema técnico de coleta de dados rurais, monitoramento de propriedades e análise agronômica.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans selection:bg-emerald-800 selection:text-white">
        {children}
      </body>
    </html>
  );
}
