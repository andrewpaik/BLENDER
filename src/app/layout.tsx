import type { Metadata } from "next";
import { Raleway, JetBrains_Mono } from "next/font/google";
import { PageTransitionProvider } from "@/components/PageTransition";
import "./globals.css";

const raleway = Raleway({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const ralewayBody = Raleway({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BLENDER",
  description: "A scroll-driven cinematic experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${raleway.variable} ${ralewayBody.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <PageTransitionProvider>
          {children}
        </PageTransitionProvider>
      </body>
    </html>
  );
}
