"use client";

import {
  Bell,
  BookOpen,
  CheckCircle2,
  Circle,
  Flame,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  ListTodo,
  Loader2,
  LogIn,
  LogOut,
  Plus,
  RefreshCw,
  Target,
  Trash2,
  TrendingUp,
  Upload
} from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
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

const statusLabels: Record<TaskStatus, string> = {
  TODO: "A fazer",
  IN_PROGRESS: "Em andamento",
  DONE: "Concluida"
};

const colorOptions = ["#18b86f", "#0ea5e9", "#f59e0b", "#f43f5e", "#8b5cf6", "#14b8a6"];

const days = [
  { day: "S", active: true },
  { day: "T", active: true },
  { day: "Q", active: true },
  { day: "Q", active: true },
  { day: "S", active: true },
  { day: "S", active: false },
  { day: "D", active: false }
];

function formatDate(value: string | null) {
  if (!value) {
    return "Sem prazo";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function getTaskProgress(tasks: StudyTask[]) {
  if (tasks.length === 0) {
    return 0;
  }

  return Math.round((tasks.filter((task) => task.status === "DONE").length / tasks.length) * 100);
}

function getGoalProgress(goal: StudyGoal) {
  if (goal.targetValue === 0) {
    return 0;
  }

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

  const stats = [
    { label: "Progresso das tarefas", value: `${progress}%`, detail: `${doneTasks} de ${tasks.length} concluidas`, icon: TrendingUp },
    { label: "Tarefas pendentes", value: String(pendingTasks), detail: `${highPriorityTasks} de alta prioridade`, icon: CheckCircle2 },
    { label: "Materias ativas", value: String(subjects.length), detail: "Organizadas por cor e sala", icon: BookOpen },
    { label: "Metas ativas", value: String(goals.length), detail: `${completedGoals} concluidas`, icon: Target }
  ];

  async function createSubject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSavingSubject(true);

    try {
      const response = await fetch("/api/subjects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
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
        headers: {
          "Content-Type": "application/json"
        },
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
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status: nextStatus })
    });

    if (!response.ok) {
      await loadData();
      setError("Nao foi possivel atualizar a tarefa.");
    }
  }

  async function deleteTask(taskId: string) {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));

    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      await loadData();
      setError("Nao foi possivel excluir a tarefa.");
    }
  }

  async function deleteSubject(subjectId: string) {
    setSubjects((currentSubjects) => currentSubjects.filter((subject) => subject.id !== subjectId));

    const response = await fetch(`/api/subjects/${subjectId}`, {
      method: "DELETE"
    });

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
        headers: {
          "Content-Type": "application/json"
        },
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
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ currentValue: nextValue })
    });

    if (!response.ok) {
      await loadData();
      setError("Nao foi possivel atualizar a meta.");
    }
  }

  async function deleteGoal(goalId: string) {
    setGoals((currentGoals) => currentGoals.filter((goal) => goal.id !== goalId));

    const response = await fetch(`/api/goals/${goalId}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      await loadData();
      setError("Nao foi possivel excluir a meta.");
    }
  }

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
              { label: "Dashboard", href: "#dashboard", icon: LayoutDashboard, active: true },
              { label: "Tarefas", href: "#tarefas", icon: ListTodo },
              { label: "Materias", href: "#materias", icon: BookOpen },
              { label: "Metas", href: "#metas", icon: Target },
              { label: "Materiais", href: "#materiais", icon: FolderOpen }
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
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
                  title="Atualizar dados"
                  aria-label="Atualizar dados"
                  onClick={loadData}
                  className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <RefreshCw size={18} />
                </button>
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
                <button
                  type="button"
                  title="Sair"
                  aria-label="Sair"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </header>

          {!isAuthenticated ? (
            <div className="grid flex-1 place-items-center px-4 py-12">
              <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-soft dark:border-slate-800 dark:bg-slate-900">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-100">
                  <LogIn size={22} />
                </div>
                <h2 className="mt-4 text-xl font-bold">Entre para ver seu painel</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Suas materias e tarefas ficam salvas na sua conta.</p>
                <Link
                  href="/login"
                  className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-500"
                >
                  <LogIn size={17} />
                  Entrar agora
                </Link>
              </section>
            </div>
          ) : (
            <div id="dashboard" className="grid gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
              <div className="space-y-6">
                {error ? (
                  <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
                    {error}
                  </p>
                ) : null}

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
                      <p className="mt-3 text-3xl font-bold">{isLoading ? "..." : stat.value}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{stat.detail}</p>
                    </article>
                  ))}
                </section>

                <section id="tarefas" className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold">Tarefas de estudo</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Prioridades dos proximos dias</p>
                    </div>
                    {isLoading ? <Loader2 className="animate-spin text-brand-600" size={20} /> : null}
                  </div>

                  <form className="mt-5 grid gap-3 rounded-lg border border-slate-100 p-4 dark:border-slate-800 lg:grid-cols-[1fr_150px_130px]" onSubmit={createTask}>
                    <label className="lg:col-span-3">
                      <span className="mb-2 block text-sm font-medium">Nova tarefa</span>
                      <input
                        className="h-11 w-full rounded-lg border border-slate-200 bg-transparent px-3 outline-none focus:border-brand-500 dark:border-slate-700"
                        onChange={(event) => setTaskTitle(event.target.value)}
                        placeholder="Ex: Revisar geometria analitica"
                        required
                        value={taskTitle}
                      />
                    </label>
                    <input
                      className="h-11 rounded-lg border border-slate-200 bg-transparent px-3 outline-none focus:border-brand-500 dark:border-slate-700 lg:col-span-3"
                      onChange={(event) => setTaskDescription(event.target.value)}
                      placeholder="Descricao opcional"
                      value={taskDescription}
                    />
                    <select
                      className="h-11 rounded-lg border border-slate-200 bg-transparent px-3 outline-none focus:border-brand-500 dark:border-slate-700"
                      onChange={(event) => setTaskSubjectId(event.target.value)}
                      value={taskSubjectId}
                    >
                      <option value="">Sem materia</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                    <select
                      className="h-11 rounded-lg border border-slate-200 bg-transparent px-3 outline-none focus:border-brand-500 dark:border-slate-700"
                      onChange={(event) => setTaskPriority(event.target.value as Priority)}
                      value={taskPriority}
                    >
                      <option value="LOW">Baixa</option>
                      <option value="MEDIUM">Media</option>
                      <option value="HIGH">Alta</option>
                    </select>
                    <input
                      className="h-11 rounded-lg border border-slate-200 bg-transparent px-3 outline-none focus:border-brand-500 dark:border-slate-700"
                      onChange={(event) => setTaskDueDate(event.target.value)}
                      type="datetime-local"
                      value={taskDueDate}
                    />
                    <button
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60 lg:col-span-3"
                      disabled={isSavingTask}
                    >
                      {isSavingTask ? <Loader2 className="animate-spin" size={17} /> : <Plus size={17} />}
                      Adicionar tarefa
                    </button>
                  </form>

                  <div className="mt-5 divide-y divide-slate-100 dark:divide-slate-800">
                    {tasks.length === 0 && !isLoading ? (
                      <p className="py-6 text-sm text-slate-500 dark:text-slate-400">Nenhuma tarefa ainda. Crie a primeira para comecar o acompanhamento.</p>
                    ) : null}
                    {tasks.map((task) => (
                      <div key={task.id} className="grid gap-3 py-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                        <button
                          type="button"
                          title={task.status === "DONE" ? "Marcar como pendente" : "Marcar como concluida"}
                          aria-label={task.status === "DONE" ? "Marcar como pendente" : "Marcar como concluida"}
                          onClick={() => updateTaskStatus(task)}
                          className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-brand-600 dark:border-slate-700"
                        >
                          {task.status === "DONE" ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                        </button>
                        <div className="min-w-0">
                          <p className={`font-semibold ${task.status === "DONE" ? "text-slate-400 line-through" : ""}`}>{task.title}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {task.subject?.name ?? "Sem materia"} - {formatDate(task.dueDate)} - {statusLabels[task.status]}
                          </p>
                          {task.description ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{task.description}</p> : null}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-fit rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
                            {priorityLabels[task.priority]}
                          </span>
                          <button
                            type="button"
                            title="Excluir tarefa"
                            aria-label="Excluir tarefa"
                            onClick={() => deleteTask(task.id)}
                            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section id="materias" className="grid gap-6 xl:grid-cols-[1fr_360px]">
                  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="text-lg font-bold">Materias</h2>
                    <div className="mt-5 space-y-4">
                      {subjects.length === 0 && !isLoading ? (
                        <p className="text-sm text-slate-500 dark:text-slate-400">Cadastre suas materias para organizar tarefas e materiais.</p>
                      ) : null}
                      {subjects.map((subject) => {
                        const totalBySubject = tasks.filter((task) => task.subject?.id === subject.id).length;
                        const doneBySubject = tasks.filter((task) => task.subject?.id === subject.id && task.status === "DONE").length;
                        const subjectProgress = totalBySubject === 0 ? 0 : Math.round((doneBySubject / totalBySubject) * 100);

                        return (
                          <div key={subject.id} className="rounded-lg border border-slate-100 p-4 dark:border-slate-800">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: subject.color }} />
                                  <p className="truncate font-semibold">{subject.name}</p>
                                </div>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                  {[subject.professor, subject.room].filter(Boolean).join(" - ") || "Sem detalhes"}
                                </p>
                              </div>
                              <button
                                type="button"
                                title="Excluir materia"
                                aria-label="Excluir materia"
                                onClick={() => deleteSubject(subject.id)}
                                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <div className="mt-4">
                              <div className="mb-2 flex items-center justify-between text-sm">
                                <span>{doneBySubject} de {totalBySubject} tarefas</span>
                                <span className="text-slate-500 dark:text-slate-400">{subjectProgress}%</span>
                              </div>
                              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                                <div className="h-2 rounded-full" style={{ width: `${subjectProgress}%`, backgroundColor: subject.color }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <form className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900" onSubmit={createSubject}>
                    <h2 className="text-lg font-bold">Nova materia</h2>
                    <div className="mt-5 space-y-3">
                      <input
                        className="h-11 w-full rounded-lg border border-slate-200 bg-transparent px-3 outline-none focus:border-brand-500 dark:border-slate-700"
                        onChange={(event) => setSubjectName(event.target.value)}
                        placeholder="Nome da materia"
                        required
                        value={subjectName}
                      />
                      <input
                        className="h-11 w-full rounded-lg border border-slate-200 bg-transparent px-3 outline-none focus:border-brand-500 dark:border-slate-700"
                        onChange={(event) => setSubjectProfessor(event.target.value)}
                        placeholder="Professor"
                        value={subjectProfessor}
                      />
                      <input
                        className="h-11 w-full rounded-lg border border-slate-200 bg-transparent px-3 outline-none focus:border-brand-500 dark:border-slate-700"
                        onChange={(event) => setSubjectRoom(event.target.value)}
                        placeholder="Sala ou horario"
                        value={subjectRoom}
                      />
                      <div className="grid grid-cols-6 gap-2">
                        {colorOptions.map((color) => (
                          <button
                            key={color}
                            type="button"
                            title={color}
                            aria-label={`Escolher cor ${color}`}
                            onClick={() => setSubjectColor(color)}
                            className={`h-9 rounded-lg border-2 ${subjectColor === color ? "border-slate-950 dark:border-white" : "border-transparent"}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <button
                        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isSavingSubject}
                      >
                        {isSavingSubject ? <Loader2 className="animate-spin" size={17} /> : <Plus size={17} />}
                        Adicionar materia
                      </button>
                    </div>
                  </form>
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

                <section id="metas" className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold">Metas</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Acompanhe entregas por unidade.</p>
                    </div>
                    <Target className="text-brand-600" size={22} />
                  </div>

                  <form className="mt-5 space-y-3 rounded-lg border border-slate-100 p-4 dark:border-slate-800" onSubmit={createGoal}>
                    <input
                      className="h-11 w-full rounded-lg border border-slate-200 bg-transparent px-3 outline-none focus:border-brand-500 dark:border-slate-700"
                      onChange={(event) => setGoalTitle(event.target.value)}
                      placeholder="Ex: Estudar algebra linear"
                      required
                      value={goalTitle}
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <select
                        className="h-11 rounded-lg border border-slate-200 bg-transparent px-3 outline-none focus:border-brand-500 dark:border-slate-700"
                        onChange={(event) => setGoalSubjectId(event.target.value)}
                        value={goalSubjectId}
                      >
                        <option value="">Sem materia</option>
                        {subjects.map((subject) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name}
                          </option>
                        ))}
                      </select>
                      <input
                        className="h-11 rounded-lg border border-slate-200 bg-transparent px-3 outline-none focus:border-brand-500 dark:border-slate-700"
                        onChange={(event) => setGoalUnit(event.target.value)}
                        placeholder="Unidade"
                        required
                        value={goalUnit}
                      />
                      <input
                        className="h-11 rounded-lg border border-slate-200 bg-transparent px-3 outline-none focus:border-brand-500 dark:border-slate-700"
                        min="1"
                        onChange={(event) => setGoalTargetValue(event.target.value)}
                        placeholder="Alvo"
                        required
                        type="number"
                        value={goalTargetValue}
                      />
                      <input
                        className="h-11 rounded-lg border border-slate-200 bg-transparent px-3 outline-none focus:border-brand-500 dark:border-slate-700"
                        min="0"
                        onChange={(event) => setGoalCurrentValue(event.target.value)}
                        placeholder="Atual"
                        type="number"
                        value={goalCurrentValue}
                      />
                    </div>
                    <input
                      className="h-11 w-full rounded-lg border border-slate-200 bg-transparent px-3 outline-none focus:border-brand-500 dark:border-slate-700"
                      onChange={(event) => setGoalDueDate(event.target.value)}
                      type="date"
                      value={goalDueDate}
                    />
                    <button
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isSavingGoal}
                    >
                      {isSavingGoal ? <Loader2 className="animate-spin" size={17} /> : <Plus size={17} />}
                      Adicionar meta
                    </button>
                  </form>

                  <div className="mt-5 space-y-4">
                    {goals.length === 0 && !isLoading ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400">Crie uma meta para acompanhar horas, paginas ou exercicios.</p>
                    ) : null}
                    {goals.map((goal) => {
                      const goalProgress = getGoalProgress(goal);

                      return (
                        <div key={goal.id} className="rounded-lg border border-slate-100 p-4 dark:border-slate-800">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-semibold">{goal.title}</p>
                              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                {goal.subject?.name ?? "Sem materia"} - {formatDate(goal.dueDate)}
                              </p>
                            </div>
                            <button
                              type="button"
                              title="Excluir meta"
                              aria-label="Excluir meta"
                              onClick={() => deleteGoal(goal.id)}
                              className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="mt-4">
                            <div className="mb-2 flex items-center justify-between text-sm">
                              <span>
                                {goal.currentValue} de {goal.targetValue} {goal.unit}
                              </span>
                              <span className="text-slate-500 dark:text-slate-400">{goalProgress}%</span>
                            </div>
                            <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800">
                              <div className="h-3 rounded-full bg-brand-600" style={{ width: `${goalProgress}%` }} />
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => updateGoalProgress(goal, -1)}
                                className="h-9 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                              >
                                -1
                              </button>
                              <button
                                type="button"
                                onClick={() => updateGoalProgress(goal, 1)}
                                className="h-9 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                              >
                                +1
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section id="materiais" className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
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
          )}
        </section>
      </div>
    </main>
  );
}
