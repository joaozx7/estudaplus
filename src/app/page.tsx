"use client";

import { ListChecks, BookOpen, Target, ArrowRight, Clock, TrendingUp, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Summary = {
  tasksPending: number;
  tasksDoneToday: number;
  subjects: number;
  goalsActive: number;
  goalsAvgProgress: number;
};

export default function DashboardPage() {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Bom dia");
    else if (h < 18) setGreeting("Boa tarde");
    else setGreeting("Boa noite");

    async function load() {
      try {
        const [tasks, subjects, goals] = await Promise.all([
          fetch("/api/tasks").then((r) => r.json()),
          fetch("/api/subjects").then((r) => r.json()),
          fetch("/api/goals").then((r) => r.json()),
        ]);

        const today = new Date().toDateString();
        const tasksPending = tasks.filter((t: any) => t.status !== "DONE").length;
        const tasksDoneToday = tasks.filter(
          (t: any) =>
            t.status === "DONE" &&
            t.updatedAt &&
            new Date(t.updatedAt).toDateString() === today
        ).length;

        const goalsActive = goals.filter((g: any) => g.currentValue < g.targetValue).length;
        const goalsAvgProgress =
          goals.length > 0
            ? Math.round(
                goals.reduce(
                  (acc: number, g: any) =>
                    acc + Math.min(100, (g.currentValue / g.targetValue) * 100),
                  0
                ) / goals.length
              )
            : 0;

        setData({
          tasksPending,
          tasksDoneToday,
          subjects: subjects.length,
          goalsActive,
          goalsAvgProgress,
        });
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const cards = [
    {
      href: "/tarefas",
      icon: ListChecks,
      label: "Tarefas pendentes",
      value: loading ? "—" : String(data?.tasksPending ?? 0),
      sub: loading ? "" : `${data?.tasksDoneToday ?? 0} concluída${data?.tasksDoneToday !== 1 ? "s" : ""} hoje`,
      accent: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
      border: "hover:border-blue-200 dark:hover:border-blue-800",
    },
    {
      href: "/materias",
      icon: BookOpen,
      label: "Matérias cadastradas",
      value: loading ? "—" : String(data?.subjects ?? 0),
      sub: "Ver todas as matérias",
      accent: "bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400",
      border: "hover:border-violet-200 dark:hover:border-violet-800",
    },
    {
      href: "/metas",
      icon: Target,
      label: "Metas em andamento",
      value: loading ? "—" : String(data?.goalsActive ?? 0),
      sub: loading ? "" : `Progresso médio: ${data?.goalsAvgProgress ?? 0}%`,
      accent: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
      border: "hover:border-emerald-200 dark:hover:border-emerald-800",
    },
  ];

  const shortcuts = [
    { href: "/tarefas", icon: ListChecks, label: "Nova tarefa", color: "text-blue-600 dark:text-blue-400" },
    { href: "/materias", icon: BookOpen, label: "Nova matéria", color: "text-violet-600 dark:text-violet-400" },
    { href: "/metas", icon: Target, label: "Nova meta", color: "text-emerald-600 dark:text-emerald-400" },
  ];

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-1">
          {greeting} 👋
        </p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Visão geral
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map(({ href, icon: Icon, label, value, sub, accent, border }) => (
          <Link
            key={href}
            href={href}
            className={`group flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-soft transition-all duration-200 dark:border-slate-800 dark:bg-slate-900 ${border}`}
          >
            <div className="flex items-start justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}>
                <Icon size={18} />
              </div>
              <ArrowRight
                size={14}
                className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500 dark:text-slate-600 dark:group-hover:text-slate-400"
              />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              {sub && (
                <p className="mt-2 text-xs text-slate-400">{sub}</p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Quick access */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Acesso rápido
        </h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {shortcuts.map(({ href, icon: Icon, label, color }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:shadow-soft dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700"
            >
              <Icon size={16} className={color} />
              {label}
              <ArrowRight size={13} className="ml-auto text-slate-300 dark:text-slate-600" />
            </Link>
          ))}
        </div>
      </div>

      {/* Stats strip */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Resumo de hoje
        </h2>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span className="text-sm text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-white">
                {loading ? "—" : data?.tasksDoneToday ?? 0}
              </span>{" "}
              tarefas concluídas
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <Clock size={16} className="text-brand-500" />
            <span className="text-sm text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-white">
                {loading ? "—" : data?.tasksPending ?? 0}
              </span>{" "}
              tarefas pendentes
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <TrendingUp size={16} className="text-violet-500" />
            <span className="text-sm text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-white">
                {loading ? "—" : `${data?.goalsAvgProgress ?? 0}%`}
              </span>{" "}
              progresso médio nas metas
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}