"use client";

import dynamic from "next/dynamic";
import { GraduationCap, LayoutDashboard, ListChecks, BookOpen, Target, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const ThemeToggle = dynamic(
  () => import("@/components/theme-toggle").then((m) => m.ThemeToggle),
  { ssr: false }
);

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tarefas", label: "Tarefas", icon: ListChecks },
  { href: "/materias", label: "Matérias", icon: BookOpen },
  { href: "/metas", label: "Metas", icon: Target },
];

export function Navbar({ userName }: { userName?: string | null }) {
  const path = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center px-4">

        {/* Logo — esquerda */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 mr-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
            <GraduationCap size={16} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            Estuda<span className="text-brand-600">+</span>
          </span>
        </Link>

        {/* Nav links — centro */}
        <nav className="flex flex-1 items-center justify-center gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = path === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Icon size={14} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Direita — dark mode + sair */}
        <div className="flex items-center gap-2 shrink-0 ml-8">
          {userName && (
            <span className="hidden text-xs text-slate-400 sm:block mr-1">
              Olá, <span className="font-medium text-slate-600 dark:text-slate-300">{userName.split(" ")[0]}</span>
            </span>
          )}
          <ThemeToggle />
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500 dark:border-slate-700 dark:hover:border-rose-900 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
            title="Sair"
          >
            <LogOut size={14} />
          </button>
        </div>

      </div>
    </header>
  );
}