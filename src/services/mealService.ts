import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Meal = Tables<"meals">;
export type UserLog = Tables<"user_logs">;

export async function logMeal(
  userId: string,
  mealName: string,
  mealType: string,
  calories: number,
  nutrients: Record<string, unknown>
) {
  // Insert meal
  const { data: meal, error: mealErr } = await supabase
    .from("meals")
    .insert({ name: mealName, calories, macros: nutrients.macros as any, category: mealType })
    .select()
    .single();
  if (mealErr) throw mealErr;

  // Insert log
  const { data: log, error: logErr } = await supabase
    .from("user_logs")
    .insert({
      user_id: userId,
      meal_id: meal.id,
      meal_name: mealName,
      meal_type: mealType,
      total_calories: calories,
      nutrients: nutrients as any,
    })
    .select()
    .single();
  if (logErr) throw logErr;
  return log;
}

export async function getTodayLogs(userId: string) {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("user_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getLogsForDateRange(userId: string, startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from("user_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function deleteLog(logId: string) {
  const { error } = await supabase.from("user_logs").delete().eq("id", logId);
  if (error) throw error;
}
