"use client";

import {
  Bell,
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  FolderOpen,
  Loader2,
  LogIn,
  Plus,
  RefreshCw,
  Target,
  Trash2,
  TrendingUp,
  Upload,
  Zap
} from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { WeeklyChart } from "@/components/weekly-chart";
import { ThemeToggle } from "@/components/theme-toggle";

type Priority = "LOW" | "MEDIUM" | "HIGH";
type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

type Subject = {
  id: string;
  name: string;
  color: string;
  professor: string | null;
  room: string | null;
};

type StudyTask = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: string | null;
  subject: Subject | null;
};

type StudyGoal = {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  dueDate: string | null;
  subject: Subject | null;
};

const priorityLabels: Record<Priority, string> = {
  LOW: "Baixa",
  MEDIUM: "Media",
  HIGH: "Alta"
};

const priorityColors: Record<Priority, string> = {
  LOW: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  MEDIUM: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  HIGH: "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
};

const colorOptions = ["#18b86f", "#0ea5e9", "#f59e0b", "#f43f5e", "#8b5cf6", "#14b8a6"];

const streakDays = [
  { day: "S", fullDay: "Segunda", active: true },
  { day: "T", fullDay: "Terca", active: true },
  { day: "Q", fullDay: "Quarta", active: true },
  { day: "Q", fullDay: "Quinta", active: true },
  { day: "S", fullDay: "Sexta", active: true },
  { day: "S", fullDay: "Sabado", active: false },
  { day: "D", fullDay: "Domingo", active: false }
];

function formatDate(value: string | null) {
  if (!value) return "Sem prazo";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function getTaskProgress(tasks: StudyTask[]) {
  if (tasks.length === 0) return 0;
  return Math.round((tasks.filter((task) => task.status === "DONE").length / tasks.length) * 100);
}

function getGoalProgress(goal: StudyGoal) {
  if (goal.targetValue === 0) return 0;
  return Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
}

export default function Home() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingTask, setIsSavingTask] = useState(false);
  const [isSavingSubject, setIsSavingSubject] = useState(false);
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskSubjectId, setTaskSubjectId] = useState("");
  const [taskPriority, setTaskPriority] = useState<Priority>("MEDIUM");
  const [taskDueDate, setTaskDueDate] = useState("");

  const [subjectName, setSubjectName] = useState("");
  const [subjectProfessor, setSubjectProfessor] = useState("");
  const [subjectRoom, setSubjectRoom] = useState("");
  const [subjectColor, setSubjectColor] = useState(colorOptions[0]);

  const [goalTitle, setGoalTitle] = useState("");
  const [goalSubjectId, setGoalSubjectId] = useState("");
  const [goalTargetValue, setGoalTargetValue] = useState("10");
  const [goalCurrentValue, setGoalCurrentValue] = useState("0");
  const [goalUnit, setGoalUnit] = useState("horas");
  const [goalDueDate, setGoalDueDate] = useState("");

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);

  async function loadData() {
    setError("");
    setIsLoading(true);

    try {
      const [subjectsResponse, tasksResponse, goalsResponse] = await Promise.all([fetch("/api/subjects"), fetch("/api/tasks"), fetch("/api/goals")]);

      if (subjectsResponse.status === 401 || tasksResponse.status === 401 || goalsResponse.status === 401) {
        setIsAuthenticated(false);
        return;
      }

      if (!subjectsResponse.ok || !tasksResponse.ok || !goalsResponse.ok) {
        throw new Error("Nao foi possivel carregar seus dados agora.");
      }

      const subjectsData = await subjectsResponse.json();
      const tasksData = await tasksResponse.json();
      const goalsData = await goalsResponse.json();
      setSubjects(subjectsData.subjects ?? []);
      setTasks(tasksData.tasks ?? []);
      setGoals(goalsData.goals ?? []);
      setIsAuthenticated(true);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Algo deu errado ao carregar o painel.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const progress = useMemo(() => getTaskProgress(tasks), [tasks]);
  const doneTasks = tasks.filter((task) => task.status === "DONE").length;
  const pendingTasks = tasks.length - doneTasks;
  const highPriorityTasks = tasks.filter((task) => task.priority === "HIGH" && task.status !== "DONE").length;
  const completedGoals = goals.filter((goal) => goal.currentValue >= goal.targetValue).length;
  const activeStreak = streakDays.filter((d) => d.active).length;

  async function createSubject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSavingSubject(true);

    try {
      const response = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: subjectName,
          color: subjectColor,
          professor: subjectProfessor,
          room: subjectRoom
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Nao foi possivel criar a materia.");
      }

      setSubjectName("");
      setSubjectProfessor("");
      setSubjectRoom("");
      setSubjectColor(colorOptions[0]);
      setShowSubjectForm(false);
      await loadData();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Erro ao criar materia.");
    } finally {
      setIsSavingSubject(false);
    }
  }

  async function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSavingTask(true);

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDescription,
          subjectId: taskSubjectId || null,
          priority: taskPriority,
          dueDate: taskDueDate || null
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Nao foi possivel criar a tarefa.");
      }

      setTaskTitle("");
      setTaskDescription("");
      setTaskSubjectId("");
      setTaskPriority("MEDIUM");
      setTaskDueDate("");
      setShowTaskForm(false);
      await loadData();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Erro ao criar tarefa.");
    } finally {
      setIsSavingTask(false);
    }
  }

  async function updateTaskStatus(task: StudyTask) {
    const nextStatus: TaskStatus = task.status === "DONE" ? "TODO" : "DONE";
    setTasks((currentTasks) =>
      currentTasks.map((currentTask) => (currentTask.id === task.id ? { ...currentTask, status: nextStatus } : currentTask))
    );

    const response = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus })
    });

    if (!response.ok) {
      await loadData();
      setError("Nao foi possivel atualizar a tarefa.");
    }
  }

  async function deleteTask(taskId: string) {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));

    const response = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });

    if (!response.ok) {
      await loadData();
      setError("Nao foi possivel excluir a tarefa.");
    }
  }

  async function deleteSubject(subjectId: string) {
    setSubjects((currentSubjects) => currentSubjects.filter((subject) => subject.id !== subjectId));

    const response = await fetch(`/api/subjects/${subjectId}`, { method: "DELETE" });

    if (!response.ok) {
      await loadData();
      setError("Nao foi possivel excluir a materia.");
    } else {
      await loadData();
    }
  }

  async function createGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSavingGoal(true);

    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: goalTitle,
          subjectId: goalSubjectId || null,
          targetValue: goalTargetValue,
          currentValue: goalCurrentValue,
          unit: goalUnit,
          dueDate: goalDueDate || null
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Nao foi possivel criar a meta.");
      }

      setGoalTitle("");
      setGoalSubjectId("");
      setGoalTargetValue("10");
      setGoalCurrentValue("0");
      setGoalUnit("horas");
      setGoalDueDate("");
      setShowGoalForm(false);
      await loadData();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Erro ao criar meta.");
    } finally {
      setIsSavingGoal(false);
    }
  }

  async function updateGoalProgress(goal: StudyGoal, amount: number) {
    const nextValue = Math.max(0, Math.min(goal.targetValue, goal.currentValue + amount));
    setGoals((currentGoals) =>
      currentGoals.map((currentGoal) => (currentGoal.id === goal.id ? { ...currentGoal, currentValue: nextValue } : currentGoal))
    );

    const response = await fetch(`/api/goals/${goal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentValue: nextValue })
    });

    if (!response.ok) {
      await loadData();
      setError("Nao foi possivel atualizar a meta.");
    }
  }

  async function deleteGoal(goalId: string) {
    setGoals((currentGoals) => currentGoals.filter((goal) => goal.id !== goalId));

    const response = await fetch(`/api/goals/${goalId}`, { method: "DELETE" });

    if (!response.ok) {
      await loadData();
      setError("Nao foi possivel excluir a meta.");
    }
  }

  if (!isAuthenticated) {
    return (
      <main className="grid min-h-screen place-items-center px-4 py-12">
        <section className="w-full max-w-md animate-scale-in rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-card dark:border-slate-800/80 dark:bg-slate-900">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-glow">
            <LogIn size={24} />
          </div>
          <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">Entre para ver seu painel</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Suas materias e tarefas ficam salvas na sua conta.</p>
          <Link
            href="/login"
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 text-sm font-semibold text-white shadow-glow transition hover:shadow-lg"
          >
            <LogIn size={17} />
            Entrar agora
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen transition-colors">
      <Sidebar />

      <div className="lg:pl-[72px]">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-slate-200/60 bg-slate-50/80 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-950/80">
          <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Bom estudo!</p>
              <h1 className="truncate text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                Seu painel academico
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                title="Atualizar dados"
                aria-label="Atualizar dados"
                onClick={loadData}
                className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200/80 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-700 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <RefreshCw size={17} className={isLoading ? "animate-spin" : ""} />
              </button>
              <button
                type="button"
                title="Notificacoes"
                aria-label="Notificacoes"
                className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200/80 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-700 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <Bell size={17} />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
              </button>
              <div className="lg:hidden">
                <ThemeToggle />
              </div>
              <button
                type="button"
                title="Sair"
                aria-label="Sair"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200/80 bg-white text-slate-500 shadow-sm transition hover:border-rose-200 hover:text-rose-500 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-rose-400 lg:hidden"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </button>
            </div>
          </div>
        </header>

        {/* Error Banner */}
        {error ? (
          <div className="mx-4 mt-4 animate-slide-up rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300 sm:mx-6 lg:mx-8">
            {error}
          </div>
        ) : null}

        {/* Dashboard Content */}
        <div id="dashboard" className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">

          {/* Row 1: Stats + Streak */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* Progress Card */}
            <article className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition hover-lift dark:border-slate-800/80 dark:bg-slate-900/80 animate-slide-up opacity-0 stagger-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Progresso</p>
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                  <TrendingUp size={18} />
                </div>
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{isLoading ? "..." : `${progress}%`}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{doneTasks} de {tasks.length} concluidas</p>
              <div className="mt-3 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </article>

            {/* Pending Tasks */}
            <article className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition hover-lift dark:border-slate-800/80 dark:bg-slate-900/80 animate-slide-up opacity-0 stagger-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pendentes</p>
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                  <Clock size={18} />
                </div>
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{isLoading ? "..." : String(pendingTasks)}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{highPriorityTasks} de alta prioridade</p>
            </article>

            {/* Subjects */}
            <article className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition hover-lift dark:border-slate-800/80 dark:bg-slate-900/80 animate-slide-up opacity-0 stagger-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Materias</p>
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400">
                  <BookOpen size={18} />
                </div>
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{isLoading ? "..." : String(subjects.length)}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Organizadas por cor</p>
            </article>

            {/* Streak Card */}
            <article className="group relative overflow-hidden rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-card transition hover-lift dark:border-amber-800/40 dark:from-amber-950/40 dark:to-orange-950/30 animate-slide-up opacity-0 stagger-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Sequencia</p>
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
                  <Flame size={18} />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">{activeStreak}</p>
                <span className="text-sm font-medium text-amber-600/80 dark:text-amber-400/80">dias</span>
              </div>
              <div className="mt-3 flex gap-1.5">
                {streakDays.map((item, index) => (
                  <div
                    key={`${item.day}-${index}`}
                    className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold transition-all ${
                      item.active
                        ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm"
                        : "bg-white/60 text-slate-400 dark:bg-slate-800/60 dark:text-slate-500"
                    }`}
                    title={item.fullDay}
                  >
                    {item.active ? <Flame size={12} /> : item.day}
                  </div>
                ))}
              </div>
            </article>
          </div>

          {/* Row 2: Chart + Tasks */}
          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            {/* Weekly Chart */}
            <div className="animate-slide-up opacity-0 stagger-5">
              <WeeklyChart />
            </div>

            {/* Tasks Section */}
            <section id="tarefas" className="rounded-2xl border border-slate-200/80 bg-white shadow-card dark:border-slate-800/80 dark:bg-slate-900/80 animate-slide-up opacity-0 stagger-6">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Tarefas</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{pendingTasks} pendentes</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTaskForm(!showTaskForm)}
                  className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600 transition hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:hover:bg-brand-900/50"
                >
                  <Plus size={16} />
                </button>
              </div>

              {showTaskForm ? (
                <form className="border-b border-slate-100 p-4 dark:border-slate-800/80 animate-scale-in" onSubmit={createTask}>
                  <div className="space-y-3">
                    <input
                      className="h-10 w-full rounded-lg border border-slate-200 bg-transparent px-3 text-sm dark:border-slate-700"
                      onChange={(event) => setTaskTitle(event.target.value)}
                      placeholder="Nova tarefa..."
                      required
                      value={taskTitle}
                    />
                    <input
                      className="h-10 w-full rounded-lg border border-slate-200 bg-transparent px-3 text-sm dark:border-slate-700"
                      onChange={(event) => setTaskDescription(event.target.value)}
                      placeholder="Descricao (opcional)"
                      value={taskDescription}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        className="h-10 rounded-lg border border-slate-200 bg-transparent px-2 text-sm dark:border-slate-700"
                        onChange={(event) => setTaskSubjectId(event.target.value)}
                        value={taskSubjectId}
                      >
                        <option value="">Materia</option>
                        {subjects.map((subject) => (
                          <option key={subject.id} value={subject.id}>{subject.name}</option>
                        ))}
                      </select>
                      <select
                        className="h-10 rounded-lg border border-slate-200 bg-transparent px-2 text-sm dark:border-slate-700"
                        onChange={(event) => setTaskPriority(event.target.value as Priority)}
                        value={taskPriority}
                      >
                        <option value="LOW">Baixa</option>
                        <option value="MEDIUM">Media</option>
                        <option value="HIGH">Alta</option>
                      </select>
                      <input
                        className="h-10 rounded-lg border border-slate-200 bg-transparent px-2 text-sm dark:border-slate-700"
                        onChange={(event) => setTaskDueDate(event.target.value)}
                        type="datetime-local"
                        value={taskDueDate}
                      />
                    </div>
                    <button
                      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                      disabled={isSavingTask}
                    >
                      {isSavingTask ? <Loader2 className="animate-spin" size={15} /> : <Plus size={15} />}
                      Adicionar
                    </button>
                  </div>
                </form>
              ) : null}

              <div className="max-h-[360px] overflow-y-auto">
                {tasks.length === 0 && !isLoading ? (
                  <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                    <CheckCircle2 size={32} className="text-slate-300 dark:text-slate-600" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma tarefa ainda</p>
                  </div>
                ) : null}
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-center gap-3 border-b border-slate-50 px-4 py-3 transition hover:bg-slate-50/50 dark:border-slate-800/40 dark:hover:bg-slate-800/30"
                  >
                    <button
                      type="button"
                      title={task.status === "DONE" ? "Marcar como pendente" : "Marcar como concluida"}
                      aria-label={task.status === "DONE" ? "Marcar como pendente" : "Marcar como concluida"}
                      onClick={() => updateTaskStatus(task)}
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition ${
                        task.status === "DONE"
                          ? "border-brand-500 bg-brand-500 text-white"
                          : "border-slate-300 text-transparent hover:border-brand-400 hover:text-brand-400 dark:border-slate-600"
                      }`}
                    >
                      {task.status === "DONE" ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium ${task.status === "DONE" ? "text-slate-400 line-through dark:text-slate-500" : "text-slate-800 dark:text-slate-200"}`}>
                        {task.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                        {task.subject?.name ?? "Geral"} &middot; {formatDate(task.dueDate)}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold ${priorityColors[task.priority]}`}>
                      {priorityLabels[task.priority]}
                    </span>
                    <button
                      type="button"
                      title="Excluir tarefa"
                      aria-label="Excluir tarefa"
                      onClick={() => deleteTask(task.id)}
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-300 opacity-0 transition group-hover:opacity-100 hover:text-rose-500 dark:text-slate-600 dark:hover:text-rose-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Row 3: Subjects + Goals */}
          <div className="grid gap-6 xl:grid-cols-2">
            {/* Subjects Section */}
            <section id="materias" className="rounded-2xl border border-slate-200/80 bg-white shadow-card dark:border-slate-800/80 dark:bg-slate-900/80 animate-slide-up opacity-0 stagger-7">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Materias</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{subjects.length} cadastradas</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSubjectForm(!showSubjectForm)}
                  className="grid h-8 w-8 place-items-center rounded-lg bg-sky-50 text-sky-600 transition hover:bg-sky-100 dark:bg-sky-900/30 dark:text-sky-400 dark:hover:bg-sky-900/50"
                >
                  <Plus size={16} />
                </button>
              </div>

              {showSubjectForm ? (
                <form className="border-b border-slate-100 p-4 dark:border-slate-800/80 animate-scale-in" onSubmit={createSubject}>
                  <div className="space-y-3">
                    <input
                      className="h-10 w-full rounded-lg border border-slate-200 bg-transparent px-3 text-sm dark:border-slate-700"
                      onChange={(event) => setSubjectName(event.target.value)}
                      placeholder="Nome da materia"
                      required
                      value={subjectName}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className="h-10 rounded-lg border border-slate-200 bg-transparent px-3 text-sm dark:border-slate-700"
                        onChange={(event) => setSubjectProfessor(event.target.value)}
                        placeholder="Professor"
                        value={subjectProfessor}
                      />
                      <input
                        className="h-10 rounded-lg border border-slate-200 bg-transparent px-3 text-sm dark:border-slate-700"
                        onChange={(event) => setSubjectRoom(event.target.value)}
                        placeholder="Sala / horario"
                        value={subjectRoom}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          type="button"
                          title={color}
                          aria-label={`Escolher cor ${color}`}
                          onClick={() => setSubjectColor(color)}
                          className={`h-7 w-7 rounded-full transition-all ${subjectColor === color ? "ring-2 ring-slate-900 ring-offset-2 dark:ring-white dark:ring-offset-slate-900" : "hover:scale-110"}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <button
                      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-sky-600 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                      disabled={isSavingSubject}
                    >
                      {isSavingSubject ? <Loader2 className="animate-spin" size={15} /> : <Plus size={15} />}
                      Adicionar
                    </button>
                  </div>
                </form>
              ) : null}

              <div className="p-4">
                {subjects.length === 0 && !isLoading ? (
                  <div className="flex flex-col items-center gap-2 py-6 text-center">
                    <BookOpen size={32} className="text-slate-300 dark:text-slate-600" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">Cadastre suas materias</p>
                  </div>
                ) : null}
                <div className="space-y-3">
                  {subjects.map((subject) => {
                    const totalBySubject = tasks.filter((task) => task.subject?.id === subject.id).length;
                    const doneBySubject = tasks.filter((task) => task.subject?.id === subject.id && task.status === "DONE").length;
                    const subjectProgress = totalBySubject === 0 ? 0 : Math.round((doneBySubject / totalBySubject) * 100);

                    return (
                      <div key={subject.id} className="group rounded-xl border border-slate-100 p-4 transition hover:border-slate-200 dark:border-slate-800 dark:hover:border-slate-700">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="h-3 w-3 shrink-0 rounded-full ring-2 ring-brand-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900" style={{ backgroundColor: subject.color }} />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{subject.name}</p>
                              <p className="text-xs text-slate-400 dark:text-slate-500">
                                {[subject.professor, subject.room].filter(Boolean).join(" - ") || "Sem detalhes"}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            title="Excluir materia"
                            aria-label="Excluir materia"
                            onClick={() => deleteSubject(subject.id)}
                            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-300 opacity-0 transition group-hover:opacity-100 hover:text-rose-500 dark:text-slate-600 dark:hover:text-rose-400"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="mt-3">
                          <div className="mb-1.5 flex items-center justify-between text-xs">
                            <span className="text-slate-500 dark:text-slate-400">{doneBySubject}/{totalBySubject} tarefas</span>
                            <span className="font-semibold text-slate-600 dark:text-slate-300">{subjectProgress}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                            <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${subjectProgress}%`, backgroundColor: subject.color }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Goals Section */}
            <section id="metas" className="rounded-2xl border border-slate-200/80 bg-white shadow-card dark:border-slate-800/80 dark:bg-slate-900/80 animate-slide-up opacity-0 stagger-7">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                    <Target size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Metas</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{completedGoals} de {goals.length} concluidas</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGoalForm(!showGoalForm)}
                  className="grid h-8 w-8 place-items-center rounded-lg bg-violet-50 text-violet-600 transition hover:bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400 dark:hover:bg-violet-900/50"
                >
                  <Plus size={16} />
                </button>
              </div>

              {showGoalForm ? (
                <form className="border-b border-slate-100 p-4 dark:border-slate-800/80 animate-scale-in" onSubmit={createGoal}>
                  <div className="space-y-3">
                    <input
                      className="h-10 w-full rounded-lg border border-slate-200 bg-transparent px-3 text-sm dark:border-slate-700"
                      onChange={(event) => setGoalTitle(event.target.value)}
                      placeholder="Ex: Estudar algebra linear"
                      required
                      value={goalTitle}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        className="h-10 rounded-lg border border-slate-200 bg-transparent px-2 text-sm dark:border-slate-700"
                        onChange={(event) => setGoalSubjectId(event.target.value)}
                        value={goalSubjectId}
                      >
                        <option value="">Materia</option>
                        {subjects.map((subject) => (
                          <option key={subject.id} value={subject.id}>{subject.name}</option>
                        ))}
                      </select>
                      <input
                        className="h-10 rounded-lg border border-slate-200 bg-transparent px-2 text-sm dark:border-slate-700"
                        onChange={(event) => setGoalUnit(event.target.value)}
                        placeholder="Unidade"
                        required
                        value={goalUnit}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className="h-10 rounded-lg border border-slate-200 bg-transparent px-2 text-sm dark:border-slate-700"
                        min="1"
                        onChange={(event) => setGoalTargetValue(event.target.value)}
                        placeholder="Alvo"
                        required
                        type="number"
                        value={goalTargetValue}
                      />
                      <input
                        className="h-10 rounded-lg border border-slate-200 bg-transparent px-2 text-sm dark:border-slate-700"
                        min="0"
                        onChange={(event) => setGoalCurrentValue(event.target.value)}
                        placeholder="Atual"
                        type="number"
                        value={goalCurrentValue}
                      />
                    </div>
                    <input
                      className="h-10 w-full rounded-lg border border-slate-200 bg-transparent px-3 text-sm dark:border-slate-700"
                      onChange={(event) => setGoalDueDate(event.target.value)}
                      type="date"
                      value={goalDueDate}
                    />
                    <button
                      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-violet-600 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                      disabled={isSavingGoal}
                    >
                      {isSavingGoal ? <Loader2 className="animate-spin" size={15} /> : <Plus size={15} />}
                      Adicionar
                    </button>
                  </div>
                </form>
              ) : null}

              <div className="p-4">
                {goals.length === 0 && !isLoading ? (
                  <div className="flex flex-col items-center gap-2 py-6 text-center">
                    <Target size={32} className="text-slate-300 dark:text-slate-600" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">Crie uma meta para acompanhar</p>
                  </div>
                ) : null}
                <div className="space-y-3">
                  {goals.map((goal) => {
                    const goalProgress = getGoalProgress(goal);
                    const isCompleted = goalProgress >= 100;

                    return (
                      <div key={goal.id} className="group rounded-xl border border-slate-100 p-4 transition hover:border-slate-200 dark:border-slate-800 dark:hover:border-slate-700">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              {isCompleted ? (
                                <Zap size={14} className="shrink-0 text-amber-500" />
                              ) : null}
                              <p className={`truncate text-sm font-semibold ${isCompleted ? "text-brand-600 dark:text-brand-400" : "text-slate-800 dark:text-slate-200"}`}>
                                {goal.title}
                              </p>
                            </div>
                            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                              {goal.subject?.name ?? "Geral"} &middot; {formatDate(goal.dueDate)}
                            </p>
                          </div>
                          <button
                            type="button"
                            title="Excluir meta"
                            aria-label="Excluir meta"
                            onClick={() => deleteGoal(goal.id)}
                            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-300 opacity-0 transition group-hover:opacity-100 hover:text-rose-500 dark:text-slate-600 dark:hover:text-rose-400"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="mt-3">
                          <div className="mb-1.5 flex items-center justify-between text-xs">
                            <span className="text-slate-500 dark:text-slate-400">
                              {goal.currentValue}/{goal.targetValue} {goal.unit}
                            </span>
                            <span className={`font-semibold ${isCompleted ? "text-brand-600 dark:text-brand-400" : "text-slate-600 dark:text-slate-300"}`}>
                              {goalProgress}%
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-500 ${isCompleted ? "bg-gradient-to-r from-brand-500 to-brand-400" : "bg-violet-500"}`}
                              style={{ width: `${goalProgress}%` }}
                            />
                          </div>
                          <div className="mt-2.5 flex gap-2">
                            <button
                              type="button"
                              onClick={() => updateGoalProgress(goal, -1)}
                              className="flex h-7 flex-1 items-center justify-center rounded-lg border border-slate-200 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                            >
                              -1
                            </button>
                            <button
                              type="button"
                              onClick={() => updateGoalProgress(goal, 1)}
                              className="flex h-7 flex-1 items-center justify-center rounded-lg border border-slate-200 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                            >
                              +1
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>

          {/* Row 4: Materials */}
          <section id="materiais" className="rounded-2xl border border-slate-200/80 bg-white shadow-card dark:border-slate-800/80 dark:bg-slate-900/80 animate-slide-up opacity-0 stagger-7">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
                  <FolderOpen size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Materiais</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Seus arquivos de estudo</p>
                </div>
              </div>
              <button
                type="button"
                title="Enviar material"
                aria-label="Enviar material"
                className="grid h-8 w-8 place-items-center rounded-lg bg-teal-50 text-teal-600 transition hover:bg-teal-100 dark:bg-teal-900/30 dark:text-teal-400 dark:hover:bg-teal-900/50"
              >
                <Upload size={16} />
              </button>
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
              {["Mapa mental - Calculo.pdf", "Slides de Biologia.pptx", "Resumo Ingles.docx"].map((file) => (
                <div key={file} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3.5 transition hover:border-slate-200 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-800/30">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
                    <FolderOpen size={16} />
                  </div>
                  <span className="min-w-0 truncate text-sm font-medium text-slate-700 dark:text-slate-300">{file}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
