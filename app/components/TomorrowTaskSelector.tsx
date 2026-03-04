"use client";

import { useState } from "react";
import { Task, Category, TomorrowTask } from "../lib/storage";

type Props = {
  tasks: Task[];
  categories: Category[];
  tomorrowTasks: TomorrowTask[];
  onToggle: (taskId: string) => void;
  onUpdatePlan: (taskId: string, plan: string) => void;
  hidePlanInput?: boolean;
};

export default function TomorrowTaskSelector({
  tasks,
  categories,
  tomorrowTasks,
  onToggle,
  onUpdatePlan,
  hidePlanInput = false,
}: Props) {
  const [search, setSearch] = useState("");
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const filteredTasks = tasks.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const isSearching = search.trim() !== "";

  return (
    <div className="flex flex-col gap-3">
      {/* タスク選択UI */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-100">
          <input
            type="text"
            placeholder="タスクを検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
          />
        </div>

        {tasks.length === 0 ? (
          <p className="text-sm text-zinc-400 p-4">
            タスク管理ページでタスクを登録してください
          </p>
        ) : isSearching ? (
          <div className="flex flex-col divide-y divide-zinc-50">
            {filteredTasks.length === 0 ? (
              <p className="text-sm text-zinc-400 p-4">該当するタスクがありません</p>
            ) : (
              filteredTasks.map((task) => {
                const checked = tomorrowTasks.some((t) => t.taskId === task.id);
                return (
                  <TaskRow
                    key={task.id}
                    task={task}
                    checked={checked}
                    onToggle={onToggle}
                  />
                );
              })
            )}
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-zinc-100">
            {categories.map((cat) => {
              const catTasks = tasks.filter((t) => t.categoryId === cat.id);
              if (catTasks.length === 0) return null;
              const isOpen = openCategories.includes(cat.id);
              const selectedCount = catTasks.filter((t) =>
                tomorrowTasks.some((tt) => tt.taskId === t.id)
              ).length;

              return (
                <div key={cat.id}>
                  <button
                    onClick={() => toggleCategory(cat.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors text-left"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-sm font-medium text-zinc-700 flex-1">{cat.name}</span>
                    {selectedCount > 0 && (
                      <span className="text-xs bg-zinc-800 text-white rounded-full px-2 py-0.5">
                        {selectedCount}
                      </span>
                    )}
                    <span className="text-zinc-400 text-xs">{isOpen ? "▲" : "▼"}</span>
                  </button>

                  {isOpen && (
                    <div className="flex flex-col divide-y divide-zinc-50 bg-zinc-50">
                      {catTasks.map((task) => {
                        const checked = tomorrowTasks.some((t) => t.taskId === task.id);
                        return (
                          <TaskRow
                            key={task.id}
                            task={task}
                            checked={checked}
                            onToggle={onToggle}
                            indent
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 登録済み一覧 */}
      {tomorrowTasks.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <p className="text-xs font-medium text-zinc-400 px-4 pt-4 pb-2">登録済み</p>
          <div className="flex flex-col divide-y divide-zinc-50">
            {tomorrowTasks.map((tt) => {
              const task = tasks.find((t) => t.id === tt.taskId);
              const category = task
                ? categories.find((c) => c.id === task.categoryId)
                : null;
              if (!task) return null;
              return (
                <div key={tt.taskId} className="px-4 py-3 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {category && (
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                    )}
                    <span className="text-sm font-medium text-zinc-700">{task.name}</span>
                    {category && (
                      <span className="text-xs text-zinc-400">{category.name}</span>
                    )}
                    <button
                      onClick={() => onToggle(tt.taskId)}
                      className="ml-auto text-xs text-zinc-400 hover:text-red-500 transition-colors"
                    >
                      削除
                    </button>
                  </div>
                  {!hidePlanInput && (
                    <input
                      type="text"
                      placeholder="具体的な予定（例: 第3章 ネットワーク）"
                      value={tt.plan}
                      onChange={(e) => onUpdatePlan(tt.taskId, e.target.value)}
                      className="border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

type TaskRowProps = {
  task: Task;
  checked: boolean;
  onToggle: (taskId: string) => void;
  indent?: boolean;
};

function TaskRow({ task, checked, onToggle, indent }: TaskRowProps) {
  return (
    <div
      onClick={() => onToggle(task.id)}
      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors hover:bg-zinc-100 ${
        indent ? "pl-8" : ""
      } ${checked ? "bg-zinc-800 hover:bg-zinc-700" : ""}`}
    >
      <span
        className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
          checked ? "bg-white border-white" : "border-zinc-300 bg-white"
        }`}
      >
        {checked && <span className="text-zinc-800 text-xs font-bold">✓</span>}
      </span>
      <span className={`text-sm ${checked ? "text-white font-medium" : "text-zinc-700"}`}>
        {task.name}
      </span>
    </div>
  );
}