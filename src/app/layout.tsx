import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Extensión Horario Visitas",
  description: "Sistema automatizado para notificar extensión de horario de visitas al estacionamiento.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className + " bg-gray-50"}>{children}</body>
    </html>
  );
}
