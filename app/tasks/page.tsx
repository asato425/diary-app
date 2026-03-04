"use client";

import { useState, useEffect } from "react";
import {
  Category,
  Task,
  getCategories,
  saveCategory,
  deleteCategory,
  getTasks,
  saveTask,
  deleteTask,
} from "../lib/storage";
import CategoryDropdown from "../components/CategoryDropdown";

const PRESET_COLORS = [
  { label: "レッド", value: "#ef4444" },
  { label: "オレンジ", value: "#f97316" },
  { label: "イエロー", value: "#eab308" },
  { label: "グリーン", value: "#22c55e" },
  { label: "ティール", value: "#14b8a6" },
  { label: "ブルー", value: "#3b82f6" },
  { label: "インディゴ", value: "#6366f1" },
  { label: "パープル", value: "#a855f7" },
  { label: "ピンク", value: "#ec4899" },
  { label: "グレー", value: "#6b7280" },
];

export default function TasksPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState(PRESET_COLORS[5].value);

  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskCategoryId, setNewTaskCategoryId] = useState("");

  useEffect(() => {
    const load = async () => {
      setCategories(await getCategories());
      setTasks(await getTasks());
      setLoading(false);
    };
    load();
  }, []);

  const addCategory = async () => {
    if (!newCategoryName.trim()) return;
    const category: Category = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      color: newCategoryColor,
    };
    await saveCategory(category);
    setCategories((prev) => [...prev, category]);
    setNewCategoryName("");
    setNewCategoryColor(PRESET_COLORS[5].value);
  };

  const handleDeleteCategory = async (id: string) => {
    await deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const addTask = async () => {
    if (!newTaskName.trim() || !newTaskCategoryId) return;
    const task: Task = {
      id: Date.now().toString(),
      name: newTaskName.trim(),
      categoryId: newTaskCategoryId,
    };
    await saveTask(task);
    setTasks((prev) => [...prev, task]);
    setNewTaskName("");
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  if (loading) {
    return <div className="text-sm text-zinc-400">読み込み中...</div>;
  }

  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-2xl font-bold text-zinc-800">タスク管理</h1>

      {/* カテゴリ */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-zinc-700">カテゴリ</h2>
        <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="カテゴリ名"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
            />
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setNewCategoryColor(color.value)}
                  title={color.label}
                  className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${
                    newCategoryColor === color.value
                      ? "ring-2 ring-offset-2 ring-zinc-400 scale-110"
                      : ""
                  }`}
                  style={{ backgroundColor: color.value }}
                />
              ))}
            </div>
            <button
              onClick={addCategory}
              className="self-end bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-700 transition-colors"
            >
              追加
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {categories.length === 0 && (
              <p className="text-sm text-zinc-400">カテゴリがありません</p>
            )}
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-50"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-sm text-zinc-700">{cat.name}</span>
                </div>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* タスク */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-zinc-700">タスク</h2>
        <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex gap-3 items-center">
            <input
              type="text"
              placeholder="タスク名"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              className="flex-1 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
            />
            <CategoryDropdown
              categories={categories}
              value={newTaskCategoryId}
              onChange={setNewTaskCategoryId}
            />
            <button
              onClick={addTask}
              className="bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-700 transition-colors"
            >
              追加
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {tasks.length === 0 && (
              <p className="text-sm text-zinc-400">タスクがありません</p>
            )}
            {categories.map((cat) => {
              const catTasks = tasks.filter((t) => t.categoryId === cat.id);
              if (catTasks.length === 0) return null;
              return (
                <div key={cat.id} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 mt-2 mb-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-xs font-medium text-zinc-500">{cat.name}</span>
                  </div>
                  {catTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-50 ml-4"
                    >
                      <span className="text-sm text-zinc-700">{task.name}</span>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}