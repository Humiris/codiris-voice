import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { CodirisWidget } from "@/components/codiris-widget";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Codiris Voice - Don't type, just speak",
  description: "The voice-to-text AI that turns speech into clear, polished writing in every app.",
  icons: {
    icon: "https://framerusercontent.com/images/6hd2q32TCQkqeTR6lgvTAQAClWE.svg",
    apple: "https://framerusercontent.com/images/6hd2q32TCQkqeTR6lgvTAQAClWE.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://talk.codiris.build/widget-loader.js" async></script>
      </head>
      <body
        className={`${playfair.variable} ${dmSans.variable} font-sans antialiased`}
      >
        {children}
        <CodirisWidget />
      <script src="/make-iframe-inject.js" /></body>
    </html>
  );
}
