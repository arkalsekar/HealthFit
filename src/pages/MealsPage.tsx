import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { logMeal } from "@/services/mealService";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, UtensilsCrossed } from "lucide-react";

export default function MealsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    mealType: "lunch",
    calories: "",
    carbs: "",
    protein: "",
    fats: "",
  });

  const handleLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.name || !form.calories) return;
    setLoading(true);
    try {
      await logMeal(user.id, form.name, form.mealType, Number(form.calories), {
        macros: {
          carbs: Number(form.carbs) || 0,
          protein: Number(form.protein) || 0,
          fats: Number(form.fats) || 0,
        },
      });
      toast({ title: "Meal logged!" });
      setForm({ name: "", mealType: "lunch", calories: "", carbs: "", protein: "", fats: "" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <UtensilsCrossed className="w-6 h-6 text-primary" /> Log a Meal
        </h1>

        <Card className="shadow-card">
          <CardHeader><CardTitle>Meal Details</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleLog} className="space-y-4">
              <div className="space-y-2">
                <Label>Meal Name</Label>
                <Input placeholder="e.g. Grilled Chicken Salad" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Meal Type</Label>
                  <Select value={form.mealType} onValueChange={(v) => setForm({ ...form, mealType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Calories</Label>
                  <Input type="number" placeholder="kcal" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Carbs (g)</Label>
                  <Input type="number" value={form.carbs} onChange={(e) => setForm({ ...form, carbs: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Protein (g)</Label>
                  <Input type="number" value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Fats (g)</Label>
                  <Input type="number" value={form.fats} onChange={(e) => setForm({ ...form, fats: e.target.value })} />
                </div>
              </div>
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Log Meal
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
