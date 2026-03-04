export type Category = {
  id: string;
  name: string;
  color: string;
};

export type Task = {
  id: string;
  name: string;
  categoryId: string;
};

export type TaskLog = {
  taskId: string;
  plan: string;
  content: string;
  achievement: "done" | "partial" | "not_done";
  minutes: number;
};

export type TomorrowTask = {
  taskId: string;
  plan: string;
};

export type DailyEntry = {
  id: string;
  date: string;
  taskLogs: TaskLog[];
  learned: string;
  tomorrowTasks: TomorrowTask[];
  memo: string;
};

// カテゴリ
export const getCategories = (): Category[] => {
  const data = localStorage.getItem("categories");
  return data ? JSON.parse(data) : [];
};

export const saveCategories = (categories: Category[]) => {
  localStorage.setItem("categories", JSON.stringify(categories));
};

// タスク
export const getTasks = (): Task[] => {
  const data = localStorage.getItem("tasks");
  return data ? JSON.parse(data) : [];
};

export const saveTasks = (tasks: Task[]) => {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// 日々の記録
export const getEntries = (): DailyEntry[] => {
  const data = localStorage.getItem("entries");
  return data ? JSON.parse(data) : [];
};

export const saveEntries = (entries: DailyEntry[]) => {
  localStorage.setItem("entries", JSON.stringify(entries));
};

// 今日の記録を取得
export const getTodayEntry = (): DailyEntry | null => {
  const today = new Date().toLocaleDateString("ja-JP");
  const entries = getEntries();
  return entries.find((e) => e.date === today) ?? null;
};

// 昨日の記録を取得
export const getYesterdayEntry = (): DailyEntry | null => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const entries = getEntries();
  return entries.find((e) => e.date === yesterday.toLocaleDateString("ja-JP")) ?? null;
};