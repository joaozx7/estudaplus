import { GraduationCap } from "lucide-react";
import { AuthForm } from "@/components/auth-form";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-paper text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_440px] lg:px-8">
        <section className="flex flex-col justify-between rounded-lg bg-slate-950 p-8 text-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-brand-500">
              <GraduationCap size={24} />
            </div>
            <div>
              <p className="text-xl font-bold">Estuda+</p>
              <p className="text-sm text-slate-300">Sua rotina academica em ordem</p>
            </div>
          </div>

          <div className="my-14 max-w-xl">
            <h1 className="text-4xl font-bold tracking-normal sm:text-5xl">Organize seus estudos com clareza.</h1>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              Tarefas, metas, materiais, materias e desempenho em um unico painel feito para estudantes.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {["Metas semanais", "Foguinho de sequencia", "Materiais por materia"].map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm font-medium">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center">
          <div className="w-full rounded-lg border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Bem-vindo</p>
                <h2 className="text-2xl font-bold">Entrar no Estuda+</h2>
              </div>
              <ThemeToggle />
            </div>

            <AuthForm />
          </div>
        </section>
      </div>
    </main>
  );
}
