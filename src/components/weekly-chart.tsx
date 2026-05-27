"use client";

import { useEffect, useState } from "react";

type DayData = {
  day: string;
  fullDay: string;
  minutes: number;
};

const mockWeekData: DayData[] = [
  { day: "Seg", fullDay: "Segunda", minutes: 120 },
  { day: "Ter", fullDay: "Terca", minutes: 90 },
  { day: "Qua", fullDay: "Quarta", minutes: 150 },
  { day: "Qui", fullDay: "Quinta", minutes: 60 },
  { day: "Sex", fullDay: "Sexta", minutes: 180 },
  { day: "Sab", fullDay: "Sabado", minutes: 45 },
  { day: "Dom", fullDay: "Domingo", minutes: 0 }
];

function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h${mins}m`;
}

export function WeeklyChart() {
  const [animated, setAnimated] = useState(false);
  const maxMinutes = Math.max(...mockWeekData.map((d) => d.minutes), 1);
  const totalMinutes = mockWeekData.reduce((sum, d) => sum + d.minutes, 0);
  const todayIndex = new Date().getDay();
  const adjustedIndex = todayIndex === 0 ? 6 : todayIndex - 1;

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card dark:border-slate-800/80 dark:bg-slate-900/80">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Tempo de estudo</h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Esta semana</p>
        </div>
        <div className="rounded-lg bg-brand-50 px-3 py-1.5 dark:bg-brand-900/30">
          <span className="text-sm font-bold text-brand-600 dark:text-brand-400">{formatMinutes(totalMinutes)}</span>
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between gap-2" style={{ height: "160px" }}>
        {mockWeekData.map((data, index) => {
          const heightPercent = maxMinutes > 0 ? (data.minutes / maxMinutes) * 100 : 0;
          const isToday = index === adjustedIndex;

          return (
            <div key={data.day} className="flex flex-1 flex-col items-center gap-2">
              <span
                className={`text-xs font-medium transition-opacity duration-500 ${animated ? "opacity-100" : "opacity-0"} ${
                  data.minutes > 0 ? "text-slate-600 dark:text-slate-300" : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {data.minutes > 0 ? formatMinutes(data.minutes) : "-"}
              </span>

              <div className="relative flex w-full flex-1 items-end justify-center">
                <div
                  className={`w-full max-w-[40px] rounded-lg transition-all duration-700 ease-out ${
                    isToday
                      ? "bg-gradient-to-t from-brand-600 to-brand-400 shadow-glow"
                      : "bg-gradient-to-t from-brand-500/60 to-brand-400/40 dark:from-brand-600/40 dark:to-brand-500/20"
                  }`}
                  style={{
                    height: animated ? `${Math.max(heightPercent, 4)}%` : "0%",
                    minHeight: data.minutes > 0 ? "8px" : "4px",
                    transitionDelay: `${index * 80}ms`
                  }}
                />
              </div>

              <span
                className={`text-xs font-medium ${
                  isToday ? "font-bold text-brand-600 dark:text-brand-400" : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {data.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
