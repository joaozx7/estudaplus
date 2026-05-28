"use client";

import dynamic from "next/dynamic";
import {
  GraduationCap,
  ListChecks,
  Lock,
  LogIn,
  Mail,
  Target,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

const ThemeToggle = dynamic(
  () => import("@/components/theme-toggle").then((mod) => mod.ThemeToggle),
  { ssr: false }
);

type Tab = "entrar" | "criar";

const BASE_DAYS = [
  { day: "Seg", h: 3 },
  { day: "Ter", h: 4 },
  { day: "Qua", h: 2 },
  { day: "Qui", h: 5 },
  { day: "Sex", h: 4 },
  { day: "Sáb", h: 3.5 },
  { day: "Dom", h: 2.5, current: true },
];

const FEATURES = [
  {
    icon: ListChecks,
    color: "bg-blue-900/30 text-blue-300",
    title: "Tarefas e prazos organizados",
    desc: "Crie tarefas por matéria, defina prioridade e acompanhe o que falta fazer.",
  },
  {
    icon: Target,
    color: "bg-purple-900/30 text-purple-400",
    title: "Metas de estudo com progresso",
    desc: "Defina quantas horas ou exercícios quer completar e veja evoluir em tempo real.",
  },
  {
    icon: TrendingUp,
    color: "bg-blue-900/20 text-blue-400",
    title: "Painel com visão geral",
    desc: "Um dashboard claro que mostra onde você está e o que priorizar.",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [days, setDays] = useState(BASE_DAYS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (tab === "criar") {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error ?? "Não foi possível criar sua conta.");
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Email ou senha incorretos.");
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo deu errado.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setDays((prev) =>
        prev.map((d) => ({
          ...d,
          h: Math.max(
            1.5,
            Math.min(
              5,
              Number((d.h + (Math.random() * 1.2 - 0.6)).toFixed(1))
            )
          ),
        }))
      );
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">

        {/* LEFT */}
        <section className="bg-white dark:bg-slate-900 px-10 py-12 flex flex-col justify-center order-2 lg:order-1">

          {/* Logo */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600 grid place-items-center">
                <GraduationCap size={20} className="text-white" />
              </div>

              <div>
                <p className="text-base font-semibold text-slate-900 dark:text-slate-50">
                  Estuda+
                </p>

                <p className="text-xs text-slate-400">
                  Sua rotina acadêmica em ordem
                </p>
              </div>
            </div>

            <ThemeToggle />
          </div>

          {/* Heading */}
          <p className="text-xs font-semibold tracking-widest uppercase text-brand-600 dark:text-brand-400 mb-2">
            Bem-vindo de volta
          </p>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 leading-snug mb-2">
            Entre na sua conta
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8 max-w-xs">
            Organize seus estudos e acompanhe sua evolução num painel simples e bonito.
          </p>

          {/* Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1 mb-7 w-fit">
            {(["entrar", "criar"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setTab(t); setError(""); }}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === t
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 shadow-sm border border-slate-200 dark:border-slate-600"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                {t === "entrar" ? "Entrar" : "Criar conta"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-0">

            {tab === "criar" && (
              <div className="relative mb-3">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-50 placeholder-slate-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition"
                />
              </div>
            )}

            <div className="relative mb-3">
              <Mail
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="email"
                placeholder="voce@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-50 placeholder-slate-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition"
              />
            </div>

            <div className="relative mb-2">
              <Lock
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="password"
                placeholder={tab === "entrar" ? "Sua senha" : "Crie uma senha (mín. 8 caracteres)"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-50 placeholder-slate-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition"
              />
            </div>

            {tab === "entrar" && (
              <div className="flex justify-end mb-5">
                <button
                  type="button"
                  className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Esqueci minha senha
                </button>
              </div>
            )}

            {tab === "criar" && <div className="mb-5" />}

            {error && (
              <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition mb-4 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                "Aguarde..."
              ) : tab === "entrar" ? (
                <>
                  <LogIn size={16} />
                  Acessar minha conta
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Criar conta grátis
                </>
              )}
            </button>
          </form>
        </section>

        {/* RIGHT */}
        <section className="bg-[#0a1628] flex flex-col justify-center px-10 py-12 gap-8 order-1 lg:order-2">

          {/* Heading */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-blue-400 mb-2">
              Por que usar o Estuda+
            </p>

            <h2 className="text-xl font-bold text-white leading-snug mb-2">
              Estude com foco.
              <br />
              Evolua todo dia.
            </h2>

            <p className="text-sm text-slate-500 leading-relaxed">
              Acompanhe seu progresso, organize matérias e bata suas metas de estudo.
            </p>
          </div>

          {/* Gráfico */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">

            <div className="flex items-center justify-between mb-5">
              <span className="text-xs text-slate-500 font-medium">
                Atividade semanal
              </span>
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            </div>

            <div className="flex items-end gap-3 h-40">
              {days.map((d) => (
                <div
                  key={d.day}
                  className="flex-1 flex flex-col items-center justify-end gap-3 h-full"
                >
                  <div className="w-full h-full flex items-end justify-center">
                    <div
                      className="w-[45%] rounded-t-2xl transition-all duration-1000 ease-in-out"
                      style={{
                        height: `${d.h * 18}%`,
                        minHeight: "20px",
                        background: d.current
                          ? "linear-gradient(to top, #2563eb, #60a5fa)"
                          : "linear-gradient(to top, rgba(37,99,235,0.35), rgba(96,165,250,0.18))",
                      }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {d.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-col gap-5">
            {FEATURES.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}
                >
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200 mb-0.5">
                    {title}
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}