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

type ViewMode = "week" | "month";

const ACHIEVEMENT_LABEL = {
  done: "達成",
  partial: "部分達成",
  not_done: "未達成",
};

const ACHIEVEMENT_COLOR = {
  done: "bg-green-100 text-green-700",
  partial: "bg-yellow-100 text-yellow-700",
  not_done: "bg-red-100 text-red-700",
};

export default function HistoryPage() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    setEntries(getEntries());
    setTasks(getTasks());
    setCategories(getCategories());
  }, []);

  const getTask = (taskId: string) => tasks.find((t) => t.id === taskId);
  const getCategory = (categoryId: string) => categories.find((c) => c.id === categoryId);

  const getFilteredEntries = (): DailyEntry[] => {
    const sorted = [...entries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    if (viewMode === "week") {
      const start = new Date(selectedDate);
      start.setDate(start.getDate() - start.getDay() + 1); // 月曜始まり
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return sorted.filter((e) => {
        const d = new Date(e.date);
        return d >= start && d <= end;
      });
    } else {
      return sorted.filter((e) => {
        const d = new Date(e.date);
        return (
          d.getFullYear() === selectedDate.getFullYear() &&
          d.getMonth() === selectedDate.getMonth()
        );
      });
    }
  };

  const movePrev = () => {
    const d = new Date(selectedDate);
    if (viewMode === "week") d.setDate(d.getDate() - 7);
    else d.setMonth(d.getMonth() - 1);
    setSelectedDate(d);
  };

  const moveNext = () => {
    const d = new Date(selectedDate);
    if (viewMode === "week") d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
    setSelectedDate(d);
  };

  const getPeriodLabel = () => {
    if (viewMode === "week") {
      const start = new Date(selectedDate);
      start.setDate(start.getDate() - start.getDay() + 1);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${start.toLocaleDateString("ja-JP")} 〜 ${end.toLocaleDateString("ja-JP")}`;
    } else {
      return `${selectedDate.getFullYear()}年${selectedDate.getMonth() + 1}月`;
    }
  };

  const filtered = getFilteredEntries();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-zinc-800">履歴</h1>

      {/* 表示切替・ナビ */}
      <div className="flex items-center gap-4">
        <div className="flex rounded-lg overflow-hidden border border-zinc-200">
          {(["week", "month"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 text-sm transition-colors ${
                viewMode === mode
                  ? "bg-zinc-800 text-white"
                  : "bg-white text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {mode === "week" ? "週" : "月"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={movePrev}
            className="px-3 py-2 rounded-lg bg-white border border-zinc-200 text-sm hover:bg-zinc-50 transition-colors"
          >
            ←
          </button>
          <span className="text-sm text-zinc-600 min-w-48 text-center">{getPeriodLabel()}</span>
          <button
            onClick={moveNext}
            className="px-3 py-2 rounded-lg bg-white border border-zinc-200 text-sm hover:bg-zinc-50 transition-colors"
          >
            →
          </button>
        </div>
      </div>

      {/* 記録一覧 */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-6 shadow-sm text-sm text-zinc-400">
          この期間の記録はありません
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((entry) => (
            <div key={entry.id} className="bg-white rounded-xl p-6 shadow-sm flex flex-col gap-4">
              <p className="text-sm font-medium text-zinc-500">{entry.date}</p>

              {/* タスクログ */}
              {entry.taskLogs.length > 0 && (
                <div className="flex flex-col gap-2">
                  {entry.taskLogs.map((log) => {
                    const task = getTask(log.taskId);
                    const category = task ? getCategory(task.categoryId) : null;
                    if (!task) return null;
                    return (
                      <div key={log.taskId} className="flex flex-col gap-1 px-3 py-2 bg-zinc-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          {category && (
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                          )}
                          <span className="text-sm font-medium text-zinc-700">{task.name}</span>
                          <span
                            className={`ml-auto text-xs px-2 py-0.5 rounded-full ${ACHIEVEMENT_COLOR[log.achievement]}`}
                          >
                            {ACHIEVEMENT_LABEL[log.achievement]}
                          </span>
                        </div>
                        {log.content && (
                          <p className="text-xs text-zinc-500 ml-4">{log.content}</p>
                        )}
                        {log.minutes > 0 && (
                          <p className="text-xs text-zinc-400 ml-4">{log.minutes}分</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 学んだこと */}
              {entry.learned && (
                <div>
                  <p className="text-xs font-medium text-zinc-400 mb-1">学んだこと</p>
                  <p className="text-sm text-zinc-700 whitespace-pre-wrap">{entry.learned}</p>
                </div>
              )}

              {/* メモ */}
              {entry.memo && (
                <div>
                  <p className="text-xs font-medium text-zinc-400 mb-1">メモ</p>
                  <p className="text-sm text-zinc-700 whitespace-pre-wrap">{entry.memo}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}