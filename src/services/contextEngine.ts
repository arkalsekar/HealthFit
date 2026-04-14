import type { Profile } from "./profileService";

export interface MealContext {
  time_of_day: string;
  location: string;
  activity_level: string;
  budget: string;
  profile: {
    age: number;
    weight: number;
    height: number;
    goals: string;
    dietary_preference: string;
    food_preferences: string[];
    health_conditions: string[];
  };
}

export function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 10) return "breakfast";
  if (hour < 14) return "lunch";
  if (hour < 17) return "snack";
  if (hour < 21) return "dinner";
  return "late-night";
}

export function buildContext(
  profile: Profile,
  overrides?: Partial<Pick<MealContext, "location" | "activity_level" | "budget">>
): MealContext {
  return {
    time_of_day: getTimeOfDay(),
    location: overrides?.location ?? "home",
    activity_level: overrides?.activity_level ?? "moderate",
    budget: overrides?.budget ?? "medium",
    profile: {
      age: profile.age ?? 25,
      weight: profile.weight ?? 70,
      height: profile.height ?? 170,
      goals: profile.goals ?? "maintenance",
      dietary_preference: profile.dietary_preference ?? "none",
      food_preferences: profile.food_preferences ?? [],
      health_conditions: profile.health_conditions ?? [],
    },
  };
}

export function buildPrompt(ctx: MealContext): string {
  return `Suggest a healthy ${ctx.time_of_day} meal based on:
- Age: ${ctx.profile.age}
- Weight: ${ctx.profile.weight} kg
- Height: ${ctx.profile.height} cm
- Goal: ${ctx.profile.goals}
- Health conditions: ${ctx.profile.health_conditions.join(", ") || "none"}
- Dietary preference: ${ctx.profile.dietary_preference}
- Time of day: ${ctx.time_of_day}
- Activity level: ${ctx.activity_level}
- Budget: ${ctx.budget}
- Preferred cuisines: ${ctx.profile.food_preferences.join(", ") || "any"}
- Location: ${ctx.location}

Return ONLY a valid JSON object (no markdown, no code blocks) with this structure:
{
  "meal_name": "string",
  "ingredients": ["string"],
  "calories": number,
  "macros": { "carbs": number, "protein": number, "fats": number },
  "micros": { "fiber": number, "vitamin_c": number, "iron": number },
  "glycemic_index": number,
  "reason": "string"
}`;
}
