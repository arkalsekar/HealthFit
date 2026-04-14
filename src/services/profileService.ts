import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesUpdate } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function updateProfile(userId: string, updates: TablesUpdate<"profiles">) {
  // Auto-calculate BMI
  if (updates.weight && updates.height) {
    const heightM = Number(updates.height) / 100;
    if (heightM > 0) {
      updates.bmi = Number((Number(updates.weight) / (heightM * heightM)).toFixed(1));
    }
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export function calculateBMR(weight: number, height: number, age: number, isMale = true): number {
  // Mifflin-St Jeor equation
  if (isMale) {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  }
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

export function calculateBMI(weight: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return heightM > 0 ? Number((weight / (heightM * heightM)).toFixed(1)) : 0;
}
