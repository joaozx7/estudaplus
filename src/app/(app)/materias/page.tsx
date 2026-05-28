"use client";

import { BookOpen, Plus, Trash2, Loader2, AlertCircle, User, DoorOpen } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

type Subject = {
  id: string;
  name: string;
  color: string;
  professor: string | null;
  room: string | null;
};

const COLOR_OPTIONS = [
  "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b",
  "#10b981", "#ef4444", "#14b8a6", "#f97316",
];

export default function MateriasPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [professor, setProfessor] = useState("");
  const [room, setRoom] = useState("");
  const [color, setColor] = useState(COLOR_OPTIONS[0]);

  async function load() {
    setLoading(true);
    try {
      const data = await fetch("/api/subjects").then((r) => r.json());
      const list = Array.isArray(data) ? data : (data.subjects ?? data.data ?? []);
      setSubjects(list);
    } catch {
      setError("Não foi possível carregar as matérias.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function createSubject(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color, professor: professor || null, room: room || null }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Erro ao criar matéria.");
      setName(""); setProfessor(""); setRoom(""); setColor(COLOR_OPTIONS[0]);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar matéria.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteSubject(id: string) {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    await fetch(`/api/subjects/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Matérias</h1>
          <p className="mt-0.5 text-sm text-slate-500">{subjects.length} matéria{subjects.length !== 1 ? "s" : ""} cadastrada{subjects.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <Plus size={16} />
          Nova matéria
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={createSubject} className="rounded-xl border border-brand-100 bg-white p-5 shadow-soft dark:border-brand-900/30 dark:bg-slate-900 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Nova matéria</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              required
              placeholder="Nome da matéria"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <input
              placeholder="Professor (opcional)"
              value={professor}
              onChange={(e) => setProfessor(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <input
              placeholder="Sala (opcional)"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          {/* Color picker */}
          <div>
            <p className="mb-2 text-xs text-slate-500">Cor da matéria</p>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full transition-all ${color === c ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : "hover:scale-105"}`}
                  style={{ background: c }}
                />
              ))}
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
              {saving ? "Salvando..." : "Criar matéria"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Subject grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 size={24} className="animate-spin" />
        </div>
      ) : subjects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center dark:border-slate-800 dark:bg-slate-900">
          <BookOpen size={28} className="mx-auto mb-3 text-slate-300" />
          <p className="text-sm text-slate-400">Nenhuma matéria cadastrada ainda.</p>
          <button onClick={() => setShowForm(true)} className="mt-3 text-sm text-brand-600 hover:underline dark:text-brand-400">
            Criar a primeira matéria
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="group relative flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 transition hover:shadow-soft dark:border-slate-800 dark:bg-slate-900"
            >
              {/* Color accent */}
              <div
                className="h-1 w-12 rounded-full"
                style={{ background: subject.color }}
              />
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: subject.color + "22" }}
                  >
                    <BookOpen size={18} style={{ color: subject.color }} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{subject.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => deleteSubject(subject.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition dark:text-slate-700 dark:hover:text-rose-400"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <div className="space-y-1.5">
                {subject.professor && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <User size={12} className="shrink-0" />
                    {subject.professor}
                  </div>
                )}
                {subject.room && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <DoorOpen size={12} className="shrink-0" />
                    {subject.room}
                  </div>
                )}
                {!subject.professor && !subject.room && (
                  <p className="text-xs text-slate-400">Sem informações adicionais</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}