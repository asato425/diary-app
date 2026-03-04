"use client";

import { useState, useEffect } from "react";
import {
  DailyEntry,
  Task,
  Category,
  getEntries,
  getTasks,
  getCategories,
} from "../lib/storage";

type Period = "week" | "month" | "all";

export default function AnalyticsPage() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [period, setPeriod] = useState<Period>("week");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setEntries(await getEntries());
      setTasks(await getTasks());
      setCategories(await getCategories());
      setLoading(false);
    };
    load();
  }, []);

  const getTask = (taskId: string) => tasks.find((t) => t.id === taskId);
  const getCategory = (categoryId: string) => categories.find((c) => c.id === categoryId);

  const getFilteredEntries = (): DailyEntry[] => {
    const now = new Date();
    return entries.filter((e) => {
      const d = new Date(e.date);
      if (period === "week") {
        const start = new Date(now);
        start.setDate(now.getDate() - 7);
        return d >= start;
      } else if (period === "month") {
        const start = new Date(now);
        start.setMonth(now.getMonth() - 1);
        return d >= start;
      }
      return true;
    });
  };

  const filtered = getFilteredEntries();

  type TaskStat = {
    taskId: string;
    total: number;
    done: number;
    partial: number;
    not_done: number;
    totalMinutes: number;
  };

  const taskStats: TaskStat[] = tasks.map((task) => {
    const logs = filtered.flatMap((e) =>
      e.taskLogs.filter((l) => l.taskId === task.id)
    );
    return {
      taskId: task.id,
      total: logs.length,
      done: logs.filter((l) => l.achievement === "done").length,
      partial: logs.filter((l) => l.achievement === "partial").length,
      not_done: logs.filter((l) => l.achievement === "not_done").length,
      totalMinutes: logs.reduce((sum, l) => sum + (l.minutes || 0), 0),
    };
  }).filter((s) => s.total > 0);

  type CategoryStat = {
    categoryId: string;
    totalMinutes: number;
  };

  const categoryStats: CategoryStat[] = categories.map((cat) => {
    const catTasks = tasks.filter((t) => t.categoryId === cat.id);
    const totalMinutes = filtered
      .flatMap((e) => e.taskLogs.filter((l) => catTasks.some((t) => t.id === l.taskId)))
      .reduce((sum, l) => sum + (l.minutes || 0), 0);
    return { categoryId: cat.id, totalMinutes };
  }).filter((s) => s.totalMinutes > 0);

  const maxMinutes = Math.max(...categoryStats.map((s) => s.totalMinutes), 1);

  if (loading) {
    return <div className="text-sm text-zinc-400">読み込み中...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-zinc-800">分析</h1>

      <div className="flex rounded-lg overflow-hidden border border-zinc-200 w-fit">
        {(["week", "month", "all"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 text-sm transition-colors ${
              period === p
                ? "bg-zinc-800 text-white"
                : "bg-white text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            {p === "week" ? "直近1週間" : p === "month" ? "直近1ヶ月" : "全期間"}
          </button>
        ))}
      </div>

      {/* カテゴリ別時間 */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-zinc-700">カテゴリ別 合計時間</h2>
        <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col gap-4">
          {categoryStats.length === 0 ? (
            <p className="text-sm text-zinc-400">データがありません</p>
          ) : (
            categoryStats
              .sort((a, b) => b.totalMinutes - a.totalMinutes)
              .map((stat) => {
                const cat = getCategory(stat.categoryId);
                if (!cat) return null;
                const hours = Math.floor(stat.totalMinutes / 60);
                const mins = stat.totalMinutes % 60;
                return (
                  <div key={stat.categoryId} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-zinc-700">{cat.name}</span>
                      </div>
                      <span className="text-zinc-500">
                        {hours > 0 ? `${hours}時間` : ""}{mins}分
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(stat.totalMinutes / maxMinutes) * 100}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </section>

      {/* タスク別達成度 */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-zinc-700">タスク別 達成度</h2>
        <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col gap-4">
          {taskStats.length === 0 ? (
            <p className="text-sm text-zinc-400">データがありません</p>
          ) : (
            taskStats.map((stat) => {
              const task = getTask(stat.taskId);
              const category = task ? getCategory(task.categoryId) : null;
              if (!task) return null;
              const doneRate = Math.round((stat.done / stat.total) * 100);
              const partialRate = Math.round((stat.partial / stat.total) * 100);
              return (
                <div key={stat.taskId} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {category && (
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                    )}
                    <span className="text-sm font-medium text-zinc-700">{task.name}</span>
                    <span className="text-xs text-zinc-400 ml-auto">{stat.total}回記録</span>
                  </div>
                  <div className="h-3 bg-zinc-100 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-green-400 transition-all"
                      style={{ width: `${doneRate}%` }}
                    />
                    <div
                      className="h-full bg-yellow-300 transition-all"
                      style={{ width: `${partialRate}%` }}
                    />
                  </div>
                  <div className="flex gap-3 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                      達成 {doneRate}%
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-yellow-300 inline-block" />
                      部分達成 {partialRate}%
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-zinc-200 inline-block" />
                      未達成 {100 - doneRate - partialRate}%
                    </span>
                    {stat.totalMinutes > 0 && (
                      <span className="ml-auto">
                        合計 {Math.floor(stat.totalMinutes / 60) > 0
                          ? `${Math.floor(stat.totalMinutes / 60)}時間`
                          : ""}
                        {stat.totalMinutes % 60}分
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}