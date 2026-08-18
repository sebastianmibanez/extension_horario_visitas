import type { Metadata, Viewport } from "next";
import { Instrument_Sans, JetBrains_Mono, Newsreader } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
});

export const metadata: Metadata = {
  title: {
    default: "Portal de residentes · Mirador Casona",
    template: "%s · Mirador Casona",
  },
  description:
    "Extensión de horario de visitas, grupos de WhatsApp y contactos de emergencia del edificio.",
  applicationName: "Portal Mirador Casona",
};

export const viewport: Viewport = {
  themeColor: "#fbfaf7",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${jetbrainsMono.variable} ${instrumentSans.variable} ${newsreader.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
