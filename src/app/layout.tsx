import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { getCurrentUser } from "@/lib/current-user";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Estuda+",
  description: "Organização e produtividade para estudantes.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  return (
    <html lang="pt-BR" suppressHydrationWarning className={outfit.variable}>
      <body style={{ fontFamily: "var(--font-outfit), system-ui, sans-serif" }}>
        <Navbar userName={user?.name} />
        <main className="mx-auto max-w-6xl px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}