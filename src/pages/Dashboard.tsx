import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getProfile, calculateBMR, type Profile } from "@/services/profileService";
import { getTodayLogs, type UserLog } from "@/services/mealService";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { Activity, Flame, Droplets, Wheat, Beef, TrendingUp } from "lucide-react";

const MACRO_COLORS = ["hsl(152, 60%, 42%)", "hsl(38, 92%, 50%)", "hsl(210, 80%, 55%)"];

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [logs, setLogs] = useState<UserLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([getProfile(user.id), getTodayLogs(user.id)])
      .then(([p, l]) => { setProfile(p); setLogs(l); })
      .finally(() => setLoading(false));
  }, [user]);

  const totalCalories = logs.reduce((s, l) => s + (l.total_calories ?? 0), 0);
  const totalMacros = logs.reduce(
    (acc, l) => {
      const n = (l.nutrients as any) ?? {};
      const m = n.macros ?? {};
      return { carbs: acc.carbs + (m.carbs ?? 0), protein: acc.protein + (m.protein ?? 0), fats: acc.fats + (m.fats ?? 0) };
    },
    { carbs: 0, protein: 0, fats: 0 }
  );

  const bmr = profile?.weight && profile?.height && profile?.age
    ? calculateBMR(profile.weight, profile.height, profile.age)
    : 2000;
  const calorieGoal = Math.round(bmr * 1.4);
  const calPercent = Math.min(100, Math.round((totalCalories / calorieGoal) * 100));

  const macroData = [
    { name: "Carbs", value: totalMacros.carbs || 1 },
    { name: "Protein", value: totalMacros.protein || 1 },
    { name: "Fats", value: totalMacros.fats || 1 },
  ];

  const mealTypeData = ["breakfast", "lunch", "dinner", "snack"].map((t) => ({
    name: t.charAt(0).toUpperCase() + t.slice(1),
    calories: logs.filter((l) => l.meal_type === t).reduce((s, l) => s + (l.total_calories ?? 0), 0),
  }));

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {profile?.fullname?.split(" ")[0] || "there"}!
          </h1>
          <p className="text-muted-foreground">Here's your daily nutrition summary</p>
        </div>

        {/* Calorie overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2 shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Flame className="w-5 h-5 text-accent" /> Calories Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-bold text-foreground">{Math.round(totalCalories)}</span>
                <span className="text-muted-foreground mb-1">/ {calorieGoal} kcal</span>
              </div>
              <Progress value={calPercent} className="h-3" />
              <p className="text-sm text-muted-foreground mt-1">{calPercent}% of daily goal</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" /> Health Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">BMI</span>
                <span className="font-semibold text-foreground">{profile?.bmi ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">BMR</span>
                <span className="font-semibold text-foreground">{Math.round(bmr)} kcal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Goal</span>
                <span className="font-semibold text-foreground capitalize">{profile?.goals ?? "—"}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Macros & meal breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Macronutrients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="w-32 h-32">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={macroData} cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={4} dataKey="value">
                        {macroData.map((_, i) => (
                          <Cell key={i} fill={MACRO_COLORS[i]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 flex-1">
                  {[
                    { label: "Carbs", value: totalMacros.carbs, icon: Wheat, color: MACRO_COLORS[0] },
                    { label: "Protein", value: totalMacros.protein, icon: Beef, color: MACRO_COLORS[1] },
                    { label: "Fats", value: totalMacros.fats, icon: Droplets, color: MACRO_COLORS[2] },
                  ].map((m) => (
                    <div key={m.label} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                      <span className="text-sm text-muted-foreground flex-1">{m.label}</span>
                      <span className="font-semibold text-foreground">{Math.round(m.value)}g</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" /> Meals by Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32">
                <ResponsiveContainer>
                  <BarChart data={mealTypeData}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="calories" fill="hsl(152, 60%, 42%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's logs */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Today's Meals ({logs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No meals logged today. Start tracking!</p>
            ) : (
              <div className="space-y-3">
                {logs.map((l) => (
                  <div key={l.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-foreground">{l.meal_name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{l.meal_type}</p>
                    </div>
                    <span className="font-semibold text-foreground">{l.total_calories} kcal</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
