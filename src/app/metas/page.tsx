"use client";

import { Target, Plus, Trash2, Loader2, AlertCircle, ChevronDown, Minus } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

type Subject = { id: string; name: string; color: string };
type Goal = {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  dueDate: string | null;
  subject: Subject | null;
};

function getProgress(goal: Goal) {
  if (goal.targetValue === 0) return 0;
  return Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
}

function formatDate(v: string | null) {
  if (!v) return null;
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(v));
}

export default function MetasPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [targetValue, setTargetValue] = useState("10");
  const [currentValue, setCurrentValue] = useState("0");
  const [unit, setUnit] = useState("horas");
  const [dueDate, setDueDate] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [g, s] = await Promise.all([
        fetch("/api/goals").then((r) => r.json()),
        fetch("/api/subjects").then((r) => r.json()),
      ]);
      setGoals(g.goals ?? g ?? []);
      setSubjects(s.subjects ?? s ?? []);
    } catch {
      setError("Não foi possível carregar as metas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function createGoal(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, subjectId: subjectId || null, targetValue, currentValue, unit, dueDate: dueDate || null }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Erro ao criar meta.");
      setTitle(""); setSubjectId(""); setTargetValue("10"); setCurrentValue("0"); setUnit("horas"); setDueDate("");
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar meta.");
    } finally {
      setSaving(false);
    }
  }

  async function updateProgress(goal: Goal, delta: number) {
    const next = Math.max(0, Math.min(goal.targetValue, goal.currentValue + delta));
    setGoals((prev) => prev.map((g) => g.id === goal.id ? { ...g, currentValue: next } : g));
    await fetch(`/api/goals/${goal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentValue: next }),
    });
  }

  async function deleteGoal(id: string) {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    await fetch(`/api/goals/${id}`, { method: "DELETE" });
  }

  const active = goals.filter((g) => g.currentValue < g.targetValue);
  const completed = goals.filter((g) => g.currentValue >= g.targetValue);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Metas</h1>
          <p className="mt-0.5 text-sm text-slate-500">{active.length} em andamento · {completed.length} concluída{completed.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <Plus size={16} />
          Nova meta
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={createGoal} className="rounded-xl border border-brand-100 bg-white p-5 shadow-soft dark:border-brand-900/30 dark:bg-slate-900 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Nova meta</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              required
              placeholder="Ex: Estudar cálculo diferencial"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
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
            <input
              placeholder="Unidade (horas, páginas...)"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <div className="flex gap-2 col-span-full sm:col-span-1">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs text-slate-500">Valor atual</label>
                <input type="number" min="0" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)}
                  className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs text-slate-500">Meta total</label>
                <input type="number" min="1" value={targetValue} onChange={(e) => setTargetValue(e.target.value)}
                  className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500">Prazo</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
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
              {saving ? "Salvando..." : "Criar meta"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Goals list */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 size={24} className="animate-spin" />
        </div>
      ) : goals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center dark:border-slate-800 dark:bg-slate-900">
          <Target size={28} className="mx-auto mb-3 text-slate-300" />
          <p className="text-sm text-slate-400">Nenhuma meta cadastrada ainda.</p>
          <button onClick={() => setShowForm(true)} className="mt-3 text-sm text-brand-600 hover:underline dark:text-brand-400">
            Criar a primeira meta
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {[{ label: "Em andamento", items: active }, { label: "Concluídas", items: completed }].map(({ label, items }) =>
            items.length === 0 ? null : (
              <div key={label}>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</h2>
                <div className="space-y-3">
                  {items.map((goal) => {
                    const pct = getProgress(goal);
                    const done = pct >= 100;
                    return (
                      <div key={goal.id} className="group rounded-xl border border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-slate-900 dark:text-white">{goal.title}</p>
                              {goal.subject && (
                                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                  <span className="h-2 w-2 rounded-full" style={{ background: goal.subject.color }} />
                                  {goal.subject.name}
                                </span>
                              )}
                            </div>
                            {goal.dueDate && (
                              <p className="mt-0.5 text-xs text-slate-400">Prazo: {formatDate(goal.dueDate)}</p>
                            )}
                          </div>
                          <button onClick={() => deleteGoal(goal.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition dark:text-slate-700 dark:hover:text-rose-400">
                            <Trash2 size={15} />
                          </button>
                        </div>
                        {/* Progress bar */}
                        <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${done ? "bg-emerald-500" : "bg-brand-500"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs text-slate-500">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{goal.currentValue}</span>
                            {" / "}{goal.targetValue} {goal.unit}
                            <span className="ml-2 text-slate-400">({pct}%)</span>
                          </p>
                          {!done && (
                            <div className="flex items-center gap-1">
                              <button onClick={() => updateProgress(goal, -1)} className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
                                <Minus size={12} />
                              </button>
                              <button onClick={() => updateProgress(goal, 1)} className="flex h-6 w-6 items-center justify-center rounded-md border border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-900/20 dark:text-brand-400">
                                <Plus size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}