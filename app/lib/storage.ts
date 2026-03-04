import { supabase } from "./supabase";

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
  id?: string;
  taskId: string;
  plan: string;
  content: string;
  achievement: "done" | "partial" | "not_done";
  minutes: number;
};

export type TomorrowTask = {
  id?: string;
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
export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase.from("categories").select("*");
  if (error) return [];
  return data.map((d) => ({ id: d.id, name: d.name, color: d.color }));
};

export const saveCategory = async (category: Category): Promise<void> => {
  await supabase.from("categories").upsert({
    id: category.id,
    name: category.name,
    color: category.color,
  });
};

export const deleteCategory = async (id: string): Promise<void> => {
  await supabase.from("categories").delete().eq("id", id);
};

// タスク
export const getTasks = async (): Promise<Task[]> => {
  const { data, error } = await supabase.from("tasks").select("*");
  if (error) return [];
  return data.map((d) => ({ id: d.id, name: d.name, categoryId: d.category_id }));
};

export const saveTask = async (task: Task): Promise<void> => {
  await supabase.from("tasks").upsert({
    id: task.id,
    name: task.name,
    category_id: task.categoryId,
  });
};

export const deleteTask = async (id: string): Promise<void> => {
  await supabase.from("tasks").delete().eq("id", id);
};

// 日々の記録
export const getEntries = async (): Promise<DailyEntry[]> => {
  const { data: entryData, error } = await supabase
    .from("daily_entries")
    .select("*")
    .order("date", { ascending: false });
  if (error || !entryData) return [];

  const entries: DailyEntry[] = await Promise.all(
    entryData.map(async (e) => {
      const { data: logs } = await supabase
        .from("task_logs")
        .select("*")
        .eq("entry_id", e.id);
      const { data: tmrTasks } = await supabase
        .from("tomorrow_tasks")
        .select("*")
        .eq("entry_id", e.id);
      return {
        id: e.id,
        date: e.date,
        learned: e.learned ?? "",
        memo: e.memo ?? "",
        taskLogs: (logs ?? []).map((l) => ({
          id: l.id,
          taskId: l.task_id,
          plan: l.plan ?? "",
          content: l.content ?? "",
          achievement: l.achievement as "done" | "partial" | "not_done",
          minutes: l.minutes ?? 0,
        })),
        tomorrowTasks: (tmrTasks ?? []).map((t) => ({
          id: t.id,
          taskId: t.task_id,
          plan: t.plan ?? "",
        })),
      };
    })
  );
  return entries;
};

export const saveEntry = async (entry: DailyEntry): Promise<void> => {
  // daily_entriesをupsert
  await supabase.from("daily_entries").upsert({
    id: entry.id,
    date: entry.date,
    learned: entry.learned,
    memo: entry.memo,
  });

  // task_logsを一旦削除して再挿入
  await supabase.from("task_logs").delete().eq("entry_id", entry.id);
  if (entry.taskLogs.length > 0) {
    await supabase.from("task_logs").insert(
      entry.taskLogs.map((l) => ({
        id: l.id ?? Date.now().toString() + Math.random(),
        entry_id: entry.id,
        task_id: l.taskId,
        plan: l.plan,
        content: l.content,
        achievement: l.achievement,
        minutes: l.minutes,
      }))
    );
  }

  // tomorrow_tasksを一旦削除して再挿入
  await supabase.from("tomorrow_tasks").delete().eq("entry_id", entry.id);
  if (entry.tomorrowTasks.length > 0) {
    await supabase.from("tomorrow_tasks").insert(
      entry.tomorrowTasks.map((t) => ({
        id: t.id ?? Date.now().toString() + Math.random(),
        entry_id: entry.id,
        task_id: t.taskId,
        plan: t.plan,
      }))
    );
  }
};

export const getEntryByDate = async (date: string): Promise<DailyEntry | null> => {
  const { data, error } = await supabase
    .from("daily_entries")
    .select("*")
    .eq("date", date)
    .single();
  if (error || !data) return null;

  const { data: logs } = await supabase
    .from("task_logs")
    .select("*")
    .eq("entry_id", data.id);
  const { data: tmrTasks } = await supabase
    .from("tomorrow_tasks")
    .select("*")
    .eq("entry_id", data.id);

  return {
    id: data.id,
    date: data.date,
    learned: data.learned ?? "",
    memo: data.memo ?? "",
    taskLogs: (logs ?? []).map((l) => ({
      id: l.id,
      taskId: l.task_id,
      plan: l.plan ?? "",
      content: l.content ?? "",
      achievement: l.achievement as "done" | "partial" | "not_done",
      minutes: l.minutes ?? 0,
    })),
    tomorrowTasks: (tmrTasks ?? []).map((t) => ({
      id: t.id,
      taskId: t.task_id,
      plan: t.plan ?? "",
    })),
  };
};

export const getYesterdayEntry = async (): Promise<DailyEntry | null> => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getEntryByDate(yesterday.toLocaleDateString("ja-JP"));
};