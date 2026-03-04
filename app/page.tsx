"use client";

import { useState, useEffect } from "react";
import {
  Task,
  TaskLog,
  TomorrowTask,
  DailyEntry,
  getTasks,
  getCategories,
  getEntries,
  saveEntry,
  getYesterdayEntry,
  Category,
} from "./lib/storage";
import TomorrowTaskSelector from "./components/TomorrowTaskSelector";

const ACHIEVEMENT_OPTIONS = [
  { value: "done", label: "達成", color: "bg-green-100 text-green-700 border-green-300" },
  { value: "partial", label: "部分達成", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  { value: "not_done", label: "未達成", color: "bg-red-100 text-red-700 border-red-300" },
] as const;

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [todayEntry, setTodayEntry] = useState<DailyEntry | null>(null);
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([]);
  const [learned, setLearned] = useState("");
  const [memo, setMemo] = useState("");
  const [tomorrowTasks, setTomorrowTasks] = useState<TomorrowTask[]>([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const today = new Date().toLocaleDateString("ja-JP");

  useEffect(() => {
    const load = async () => {
      const allTasks = await getTasks();
      const allCategories = await getCategories();
      const allEntries = await getEntries();
      const yesterday = await getYesterdayEntry();

      setTasks(allTasks);
      setCategories(allCategories);

      const existing = allEntries.find((e) => e.date === today);
      if (existing) {
        setTodayEntry(existing);
        setTaskLogs(existing.taskLogs);
        setLearned(existing.learned);
        setMemo(existing.memo);
        setTomorrowTasks(existing.tomorrowTasks);
      } else {
        const initialLogs: TaskLog[] = (yesterday?.tomorrowTasks ?? []).map((t) => ({
          taskId: t.taskId,
          plan: t.plan,
          content: "",
          achievement: "not_done",
          minutes: 0,
        }));
        setTaskLogs(initialLogs);
        setTomorrowTasks([]);
      }
      setLoading(false);
    };
    load();
  }, []);

  const updateTaskLog = (taskId: string, field: keyof TaskLog, value: string | number) => {
    setTaskLogs((prev) =>
      prev.map((log) => (log.taskId === taskId ? { ...log, [field]: value } : log))
    );
  };

  const toggleTomorrowTask = (taskId: string) => {
    setTomorrowTasks((prev) => {
      const exists = prev.find((t) => t.taskId === taskId);
      if (exists) return prev.filter((t) => t.taskId !== taskId);
      return [...prev, { taskId, plan: "" }];
    });
  };

  const updateTomorrowPlan = (taskId: string, plan: string) => {
    setTomorrowTasks((prev) =>
      prev.map((t) => (t.taskId === taskId ? { ...t, plan } : t))
    );
  };

  const handleSave = async () => {
    const entry: DailyEntry = {
      id: todayEntry?.id ?? Date.now().toString(),
      date: today,
      taskLogs,
      learned,
      memo,
      tomorrowTasks,
    };
    await saveEntry(entry);
    setTodayEntry(entry);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const getTask = (taskId: string) => tasks.find((t) => t.id === taskId);
  const getCategory = (categoryId: string) => categories.find((c) => c.id === categoryId);

  if (loading) {
    return <div className="text-sm text-zinc-400">読み込み中...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-800">今日の記録</h1>
        <span className="text-sm text-zinc-400">{today}</span>
      </div>

      {/* 今日のタスク */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-zinc-700">今日のタスク</h2>
        {taskLogs.length === 0 ? (
          <div className="bg-white rounded-xl p-6 shadow-sm text-sm text-zinc-400">
            昨日の記録がないか、タスクが設定されていません
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {taskLogs.map((log) => {
              const task = getTask(log.taskId);
              const category = task ? getCategory(task.categoryId) : null;
              if (!task) return null;
              return (
                <div key={log.taskId} className="bg-white rounded-xl p-5 shadow-sm flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    {category && (
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                    )}
                    <span className="font-medium text-zinc-800">{task.name}</span>
                    {category && (
                      <span className="text-xs text-zinc-400">{category.name}</span>
                    )}
                  </div>
                  {log.plan && (
                    <div className="text-xs text-zinc-400 bg-zinc-50 rounded-lg px-3 py-2">
                      予定：{log.plan}
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="実際にやった内容"
                    value={log.content}
                    onChange={(e) => updateTaskLog(log.taskId, "content", e.target.value)}
                    className="border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
                  />
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-zinc-500">達成度：</span>
                    {ACHIEVEMENT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateTaskLog(log.taskId, "achievement", opt.value)}
                        className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                          log.achievement === opt.value
                            ? opt.color
                            : "bg-zinc-50 text-zinc-400 border-zinc-200"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                    <div className="ml-auto flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        value={log.minutes || ""}
                        onChange={(e) => updateTaskLog(log.taskId, "minutes", Number(e.target.value))}
                        placeholder="0"
                        className="w-16 border border-zinc-200 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-zinc-300"
                      />
                      <span className="text-xs text-zinc-500">分</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 学んだこと */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-zinc-700">学んだこと</h2>
        <textarea
          className="bg-white rounded-xl p-5 shadow-sm border border-zinc-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-zinc-300 w-full"
          rows={4}
          placeholder="今日学んだことを書いてみよう"
          value={learned}
          onChange={(e) => setLearned(e.target.value)}
        />
      </section>

      {/* 明日やること */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-zinc-700">明日やること</h2>
        <TomorrowTaskSelector
          tasks={tasks}
          categories={categories}
          tomorrowTasks={tomorrowTasks}
          onToggle={toggleTomorrowTask}
          onUpdatePlan={updateTomorrowPlan}
        />
      </section>

      {/* メモ */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-zinc-700">メモ</h2>
        <textarea
          className="bg-white rounded-xl p-5 shadow-sm border border-zinc-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-zinc-300 w-full"
          rows={3}
          placeholder="その他気づいたことなど"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </section>

      {/* 保存ボタン */}
      <button
        onClick={handleSave}
        className={`self-end px-8 py-3 rounded-xl text-sm font-medium transition-colors ${
          saved ? "bg-green-600 text-white" : "bg-zinc-800 text-white hover:bg-zinc-700"
        }`}
      >
        {saved ? "保存しました ✓" : "保存"}
      </button>
    </div>
  );
}