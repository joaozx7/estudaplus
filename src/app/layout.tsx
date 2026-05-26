import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Estuda+",
  description: "Organizacao e produtividade para estudantes."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
