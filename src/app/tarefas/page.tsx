"use client";

import {
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

type Priority = "LOW" | "MEDIUM" | "HIGH";
type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

type Subject = { id: string; name: string; color: string };
type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: string | null;
  subject: Subject | null;
};

const PRIORITY_LABEL: Record<Priority, string> = { LOW: "Baixa", MEDIUM: "Média", HIGH: "Alta" };
const PRIORITY_COLOR: Record<Priority, string> = {
  LOW: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  MEDIUM: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  HIGH: "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400",
};
const STATUS_LABEL: Record<TaskStatus, string> = { TODO: "A fazer", IN_PROGRESS: "Em andamento", DONE: "Concluída" };

function formatDate(v: string | null) {
  if (!v) return null;
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(v));
}

export default function TarefasPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "ALL">("ALL");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [subjectId, setSubjectId] = useState("");
  const [dueDate, setDueDate] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [t, s] = await Promise.all([
        fetch("/api/tasks").then((r) => r.json()),
        fetch("/api/subjects").then((r) => r.json()),
      ]);
      setTasks(t.tasks ?? t ?? []);
      setSubjects(s.subjects ?? s ?? []);
    } catch {
      setError("Não foi possível carregar as tarefas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function createTask(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, priority, subjectId: subjectId || null, dueDate: dueDate || null }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Erro ao criar tarefa.");
      setTitle(""); setDescription(""); setPriority("MEDIUM"); setSubjectId(""); setDueDate("");
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar tarefa.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task: Task) {
    const next: TaskStatus = task.status === "DONE" ? "TODO" : "DONE";
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: next } : t));
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
  }

  async function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  }

  const filtered = filterStatus === "ALL" ? tasks : tasks.filter((t) => t.status === filterStatus);
  const counts = {
    ALL: tasks.length,
    TODO: tasks.filter((t) => t.status === "TODO").length,
    IN_PROGRESS: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    DONE: tasks.filter((t) => t.status === "DONE").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tarefas</h1>
          <p className="mt-0.5 text-sm text-slate-500">{counts.TODO} pendente{counts.TODO !== 1 ? "s" : ""} · {counts.DONE} concluída{counts.DONE !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <Plus size={16} />
          Nova tarefa
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={createTask} className="rounded-xl border border-brand-100 bg-white p-5 shadow-soft dark:border-brand-900/30 dark:bg-slate-900 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Nova tarefa</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              required
              placeholder="Título da tarefa"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <input
              placeholder="Descrição (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <div className="relative">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 pl-3 pr-8 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="LOW">Prioridade Baixa</option>
                <option value="MEDIUM">Prioridade Média</option>
                <option value="HIGH">Prioridade Alta</option>
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <div className="relative">
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 pl-3 pr-8 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">Sem matéria</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500">Prazo</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
          {error && (
            <p className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-400">
              <AlertCircle size={14} /> {error}
            </p>
          )}
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              {saving ? "Salvando..." : "Criar tarefa"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900 w-fit">
        {(["ALL", "TODO", "IN_PROGRESS", "DONE"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filterStatus === s
                ? "bg-brand-600 text-white"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {s === "ALL" ? "Todas" : STATUS_LABEL[s]} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Task list */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 size={24} className="animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-400">Nenhuma tarefa aqui ainda.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => (
            <div
              key={task.id}
              className={`flex items-start gap-3 rounded-xl border bg-white px-4 py-3.5 transition dark:bg-slate-900 ${
                task.status === "DONE"
                  ? "border-slate-100 opacity-60 dark:border-slate-800"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <button onClick={() => toggleTask(task)} className="mt-0.5 shrink-0 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400">
                {task.status === "DONE"
                  ? <CheckCircle2 size={18} className="text-emerald-500" />
                  : <Circle size={18} />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${task.status === "DONE" ? "line-through text-slate-400" : "text-slate-900 dark:text-white"}`}>
                  {task.title}
                </p>
                {task.description && (
                  <p className="mt-0.5 text-xs text-slate-400 truncate">{task.description}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${PRIORITY_COLOR[task.priority]}`}>
                    {PRIORITY_LABEL[task.priority]}
                  </span>
                  {task.subject && (
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="h-2 w-2 rounded-full" style={{ background: task.subject.color }} />
                      {task.subject.name}
                    </span>
                  )}
                  {task.dueDate && (
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock size={11} />
                      {formatDate(task.dueDate)}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="shrink-0 text-slate-300 hover:text-rose-500 transition dark:text-slate-700 dark:hover:text-rose-400"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}