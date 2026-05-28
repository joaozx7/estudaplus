import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Estuda+",
  description: "Organização e produtividade para estudantes.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={outfit.variable}>
      <body style={{ fontFamily: "var(--font-outfit), system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}