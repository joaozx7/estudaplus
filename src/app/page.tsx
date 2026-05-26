import {
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Flame,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  ListTodo,
  Plus,
  Target,
  TrendingUp,
  Upload
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const stats = [
  { label: "Progresso semanal", value: "74%", detail: "+12% vs. semana passada", icon: TrendingUp },
  { label: "Tarefas concluidas", value: "18", detail: "5 ainda pendentes", icon: CheckCircle2 },
  { label: "Sequencia atual", value: "9 dias", detail: "foguinho ativo", icon: Flame },
  { label: "Horas estudadas", value: "23h", detail: "meta: 28h", icon: CalendarDays }
];

const tasks = [
  { title: "Revisar derivadas", subject: "Calculo", time: "Hoje, 19:00", priority: "Alta" },
  { title: "Resumo de citologia", subject: "Biologia", time: "Amanha, 08:30", priority: "Media" },
  { title: "Lista de exercicios", subject: "Fisica", time: "Sex, 16:00", priority: "Alta" },
  { title: "Flashcards de ingles", subject: "Ingles", time: "Sab, 10:00", priority: "Baixa" }
];

const subjects = [
  { name: "Calculo", progress: 82, color: "bg-emerald-500" },
  { name: "Biologia", progress: 64, color: "bg-sky-500" },
  { name: "Fisica", progress: 58, color: "bg-amber-500" },
  { name: "Ingles", progress: 76, color: "bg-rose-500" }
];

const days = [
  { day: "S", active: true },
  { day: "T", active: true },
  { day: "Q", active: true },
  { day: "Q", active: true },
  { day: "S", active: true },
  { day: "S", active: false },
  { day: "D", active: false }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-paper text-slate-950 transition dark:bg-slate-950 dark:text-slate-50">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white px-5 py-6 dark:border-slate-800 dark:bg-slate-900 lg:block">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-500 text-white">
              <GraduationCap size={22} />
            </div>
            <div>
              <p className="text-lg font-bold">Estuda+</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Painel do aluno</p>
            </div>
          </div>

          <nav className="mt-9 space-y-1">
            {[
              { label: "Dashboard", icon: LayoutDashboard, active: true },
              { label: "Tarefas", icon: ListTodo },
              { label: "Metas", icon: Target },
              { label: "Materias", icon: BookOpen },
              { label: "Materiais", icon: FolderOpen }
            ].map((item) => (
              <a
                key={item.label}
                href="#"
                className={`flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${
                  item.active
                    ? "bg-brand-50 text-brand-900 dark:bg-brand-900/30 dark:text-brand-100"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-paper/90 px-4 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-slate-500 dark:text-slate-400">Bom estudo, Lucas</p>
                <h1 className="truncate text-2xl font-bold tracking-normal sm:text-3xl">Seu progresso academico</h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  title="Notificacoes"
                  aria-label="Notificacoes"
                  className="relative grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <Bell size={18} />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
                </button>
                <ThemeToggle />
              </div>
            </div>
          </header>

          <div className="grid gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_340px] lg:px-8">
            <div className="space-y-6">
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <article
                    key={stat.label}
                    className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                      <stat.icon className="text-brand-600" size={20} />
                    </div>
                    <p className="mt-3 text-3xl font-bold">{stat.value}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{stat.detail}</p>
                  </article>
                ))}
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold">Tarefas de estudo</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Prioridades dos proximos dias</p>
                  </div>
                  <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-500">
                    <Plus size={17} />
                    Nova tarefa
                  </button>
                </div>

                <div className="mt-5 divide-y divide-slate-100 dark:divide-slate-800">
                  {tasks.map((task) => (
                    <div key={task.title} className="grid gap-3 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                      <div className="min-w-0">
                        <p className="font-semibold">{task.title}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {task.subject} • {task.time}
                        </p>
                      </div>
                      <span className="w-fit rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="text-lg font-bold">Materias</h2>
                  <div className="mt-5 space-y-5">
                    {subjects.map((subject) => (
                      <div key={subject.name}>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="font-medium">{subject.name}</span>
                          <span className="text-slate-500 dark:text-slate-400">{subject.progress}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                          <div className={`h-2 rounded-full ${subject.color}`} style={{ width: `${subject.progress}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="text-lg font-bold">Desempenho</h2>
                  <div className="mt-5 flex h-56 items-end gap-3">
                    {[42, 58, 50, 72, 64, 88, 74].map((height, index) => (
                      <div key={index} className="flex flex-1 flex-col items-center gap-2">
                        <div className="w-full rounded-t-md bg-brand-500/85" style={{ height: `${height}%` }} />
                        <span className="text-xs text-slate-500 dark:text-slate-400">{index + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">Sequencia</h2>
                  <Flame className="text-amber-500" size={22} />
                </div>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Estude hoje para manter o foguinho.</p>
                <div className="mt-5 grid grid-cols-7 gap-2">
                  {days.map((item, index) => (
                    <div key={`${item.day}-${index}`} className="text-center">
                      <div
                        className={`grid aspect-square place-items-center rounded-lg border text-sm font-bold ${
                          item.active
                            ? "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-700 dark:bg-amber-950/40"
                            : "border-slate-200 text-slate-400 dark:border-slate-700"
                        }`}
                      >
                        {item.active ? <Flame size={17} /> : item.day}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-lg font-bold">Meta principal</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Concluir 28 horas de estudo nesta semana.</p>
                <div className="mt-5">
                  <div className="mb-2 flex justify-between text-sm">
                    <span>23h concluidas</span>
                    <span>82%</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-3 w-[82%] rounded-full bg-brand-600" />
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">Materiais</h2>
                  <button
                    type="button"
                    title="Enviar material"
                    aria-label="Enviar material"
                    className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <Upload size={17} />
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  {["Mapa mental - Calculo.pdf", "Slides de Biologia.pptx", "Resumo Ingles.docx"].map((file) => (
                    <div key={file} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                      <FolderOpen size={18} className="text-brand-600" />
                      <span className="min-w-0 truncate text-sm font-medium">{file}</span>
                    </div>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
