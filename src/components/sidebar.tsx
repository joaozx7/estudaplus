"use client";

import {
  BookOpen,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Target
} from "lucide-react";
import { signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/theme-toggle";

type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  active?: boolean;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "#dashboard", icon: LayoutDashboard, active: true },
  { label: "Tarefas", href: "#tarefas", icon: ListTodo },
  { label: "Materias", href: "#materias", icon: BookOpen },
  { label: "Metas", href: "#metas", icon: Target },
  { label: "Materiais", href: "#materiais", icon: FolderOpen }
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[72px] flex-col border-r border-slate-200/80 bg-white/90 backdrop-blur-sm transition-all dark:border-slate-800/80 dark:bg-slate-900/90 lg:flex">
      <div className="flex h-16 items-center justify-center">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-glow">
          <GraduationCap size={20} />
        </div>
      </div>

      <nav className="mt-4 flex flex-1 flex-col items-center gap-1 px-3">
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={`sidebar-item group relative flex h-11 w-11 items-center justify-center rounded-xl transition-all ${
              item.active
                ? "bg-brand-50 text-brand-600 shadow-sm dark:bg-brand-900/30 dark:text-brand-400"
                : "text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <item.icon size={20} />
            <span className="sidebar-tooltip absolute left-full ml-3 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg dark:bg-slate-700">
              {item.label}
            </span>
          </a>
        ))}
      </nav>

      <div className="flex flex-col items-center gap-2 pb-4">
        <ThemeToggle />
        <button
          type="button"
          title="Sair"
          aria-label="Sair"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="sidebar-item group relative flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-500 dark:text-slate-500 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
        >
          <LogOut size={20} />
          <span className="sidebar-tooltip absolute left-full ml-3 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg dark:bg-slate-700">
            Sair
          </span>
        </button>
      </div>
    </aside>
  );
}
