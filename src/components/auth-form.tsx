"use client";

import { BookOpen, Lock, Mail, UserRound } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type Mode = "login" | "register";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (mode === "register") {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ name, email, password })
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error ?? "Nao foi possivel criar sua conta.");
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false
      });

      if (result?.error) {
        throw new Error("Email ou senha incorretos.");
      }

      router.push("/");
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Algo deu errado.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`h-10 rounded-md text-sm font-semibold transition ${
            mode === "login"
              ? "bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`h-10 rounded-md text-sm font-semibold transition ${
            mode === "register"
              ? "bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          Criar conta
        </button>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {mode === "register" ? (
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Nome</span>
            <span className="flex h-11 items-center gap-3 rounded-lg border border-slate-200 px-3 dark:border-slate-700">
              <UserRound size={18} className="text-slate-400" />
              <input
                className="min-w-0 flex-1 bg-transparent outline-none"
                onChange={(event) => setName(event.target.value)}
                placeholder="Lucas"
                value={name}
              />
            </span>
          </label>
        ) : null}

        <label className="block">
          <span className="mb-2 block text-sm font-medium">Email</span>
          <span className="flex h-11 items-center gap-3 rounded-lg border border-slate-200 px-3 dark:border-slate-700">
            <Mail size={18} className="text-slate-400" />
            <input
              className="min-w-0 flex-1 bg-transparent outline-none"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@email.com"
              required
              type="email"
              value={email}
            />
          </span>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium">Senha</span>
          <span className="flex h-11 items-center gap-3 rounded-lg border border-slate-200 px-3 dark:border-slate-700">
            <Lock size={18} className="text-slate-400" />
            <input
              className="min-w-0 flex-1 bg-transparent outline-none"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimo 8 caracteres"
              required
              type="password"
              value={password}
            />
          </span>
        </label>

        {error ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
            {error}
          </p>
        ) : null}

        <button
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isLoading}
        >
          <BookOpen size={18} />
          {isLoading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar e entrar"}
        </button>
      </form>
    </div>
  );
}
