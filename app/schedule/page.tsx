"use client";

import { useState, useEffect } from "react";
import {
  Task,
  Category,
  ScheduledTask,
  getTasks,
  getCategories,
  getScheduledTasks,
  saveScheduledTask,
  deleteScheduledTask,
} from "../lib/storage";
import TomorrowTaskSelector from "../components/TomorrowTaskSelector";
import { SkeletonBlock, SkeletonCard } from "../components/Skeleton";

export default function SchedulePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [loading, setLoading] = useState(true);

  const [newScheduleTaskId, setNewScheduleTaskId] = useState("");
  const [newScheduleStartDate, setNewScheduleStartDate] = useState("");
  const [newScheduleEndDate, setNewScheduleEndDate] = useState("");
  const [newSchedulePlan, setNewSchedulePlan] = useState("");

  useEffect(() => {
    const load = async () => {
      setTasks(await getTasks());
      setCategories(await getCategories());
      setScheduledTasks(await getScheduledTasks());
      setLoading(false);
    };
    load();
  }, []);

  const addScheduledTask = async () => {
    if (!newScheduleTaskId || !newScheduleStartDate) return;
    const scheduled: ScheduledTask = {
      id: Date.now().toString(),
      taskId: newScheduleTaskId,
      startDate: newScheduleStartDate,
      endDate: newScheduleEndDate || newScheduleStartDate,
      plan: newSchedulePlan,
    };
    await saveScheduledTask(scheduled);
    setScheduledTasks((prev) => [...prev, scheduled]);
    setNewScheduleTaskId("");
    setNewScheduleStartDate("");
    setNewScheduleEndDate("");
    setNewSchedulePlan("");
  };

  const handleDeleteScheduledTask = async (id: string) => {
    await deleteScheduledTask(id);
    setScheduledTasks((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdateScheduledTask = async (id: string, plan: string) => {
    const updated = scheduledTasks.map((s) =>
      s.id === id ? { ...s, plan } : s
    );
    setScheduledTasks(updated);
    const target = updated.find((s) => s.id === id);
    if (target) await saveScheduledTask(target);
  };

  const getTask = (taskId: string) => tasks.find((t) => t.id === taskId);
  const getCategory = (categoryId: string) => categories.find((c) => c.id === categoryId);

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <SkeletonBlock className="h-8 w-40" />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-zinc-800">予定管理</h1>

      {/* 新規追加 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-zinc-700">予定を追加</h2>
        <div className="bg-white rounded-xl p-5 shadow-sm flex flex-col gap-3">
          <TomorrowTaskSelector
            tasks={tasks}
            categories={categories}
            tomorrowTasks={newScheduleTaskId ? [{ taskId: newScheduleTaskId, plan: "" }] : []}
            onToggle={(taskId) =>
              setNewScheduleTaskId(newScheduleTaskId === taskId ? "" : taskId)
            }
            onUpdatePlan={() => {}}
            hidePlanInput={true}
          />
          <div className="flex gap-2 items-center">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs text-zinc-500">開始日</label>
              <input
                type="date"
                value={newScheduleStartDate}
                min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                onChange={(e) => {
                  setNewScheduleStartDate(e.target.value);
                  if (!newScheduleEndDate) setNewScheduleEndDate(e.target.value);
                }}
                className="border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
              />
            </div>
            <span className="text-zinc-400 mt-5">〜</span>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs text-zinc-500">終了日（1日だけなら開始日と同じ）</label>
              <input
                type="date"
                value={newScheduleEndDate}
                min={newScheduleStartDate || new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                onChange={(e) => setNewScheduleEndDate(e.target.value)}
                className="border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
              />
            </div>
          </div>
          <input
            type="text"
            placeholder="具体的な予定内容"
            value={newSchedulePlan}
            onChange={(e) => setNewSchedulePlan(e.target.value)}
            className="border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
          />
          <button
            onClick={addScheduledTask}
            className="self-end bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-700 transition-colors"
          >
            追加
          </button>
        </div>
      </section>

      {/* 登録済み一覧 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-zinc-700">登録済みの予定</h2>
        <div className="bg-white rounded-xl p-5 shadow-sm flex flex-col gap-3">
          {scheduledTasks.length === 0 ? (
            <p className="text-sm text-zinc-400">予定はありません</p>
          ) : (
            scheduledTasks
              .sort((a, b) => a.startDate.localeCompare(b.startDate))
              .map((s) => {
                const task = getTask(s.taskId);
                const category = task ? getCategory(task.categoryId) : null;
                if (!task) return null;
                return (
                  <div key={s.id} className="flex flex-col gap-2 px-3 py-3 bg-zinc-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {category && (
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                      )}
                      <span className="text-sm font-medium text-zinc-700">{task.name}</span>
                      <span className="text-xs text-zinc-400 ml-auto">
                        {s.startDate}{s.startDate !== s.endDate ? ` 〜 ${s.endDate}` : ""}
                      </span>
                      <button
                        onClick={() => handleDeleteScheduledTask(s.id)}
                        className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
                      >
                        削除
                      </button>
                    </div>
                    <input
                      type="text"
                      value={s.plan}
                      onChange={(e) => handleUpdateScheduledTask(s.id, e.target.value)}
                      placeholder="予定内容"
                      className="border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
                    />
                  </div>
                );
              })
          )}
        </div>
      </section>
    </div>
  );
}