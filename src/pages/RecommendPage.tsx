import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getProfile, type Profile } from "@/services/profileService";
import { buildContext, buildPrompt } from "@/services/contextEngine";
import { logMeal } from "@/services/mealService";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Plus, Utensils } from "lucide-react";

interface AIRecommendation {
  meal_name: string;
  ingredients: string[];
  calories: number;
  macros: { carbs: number; protein: number; fats: number };
  micros?: Record<string, number>;
  glycemic_index?: number;
  reason: string;
}

export default function RecommendPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [savingMeal, setSavingMeal] = useState(false);

  const [context, setContext] = useState({
    location: "home",
    activity_level: "moderate",
    budget: "medium",
  });

  useEffect(() => {
    if (!user) return;
    getProfile(user.id).then((p) => { setProfile(p); setProfileLoading(false); });
  }, [user]);

  const getRecommendation = async () => {
    if (!profile) {
      toast({ title: "Complete your profile first", variant: "destructive" });
      return;
    }
    setLoading(true);
    setRecommendation(null);
    try {
      const ctx = buildContext(profile, context);
      const prompt = buildPrompt(ctx);

      const { data, error } = await supabase.functions.invoke("ai-recommend", {
        body: { prompt },
      });

      if (error) throw error;

      if (data?.error) {
        toast({ title: "AI Error", description: data.error, variant: "destructive" });
        return;
      }

      setRecommendation(data.recommendation);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMeal = async () => {
    if (!user || !recommendation) return;
    setSavingMeal(true);
    try {
      const ctx = buildContext(profile!, context);
      await logMeal(user.id, recommendation.meal_name, ctx.time_of_day, recommendation.calories, {
        macros: recommendation.macros,
        micros: recommendation.micros,
      });
      toast({ title: "Meal logged!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSavingMeal(false);
    }
  };

  if (profileLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-accent" /> AI Meal Recommendation
        </h1>

        <Card className="shadow-card">
          <CardHeader><CardTitle>Your Context</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={context.location} onValueChange={(v) => setContext({ ...context, location: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="college">College</SelectItem>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Activity Level</Label>
                <Select value={context.activity_level} onValueChange={(v) => setContext({ ...context, activity_level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="very_active">Very Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Budget</Label>
                <Select value={context.budget} onValueChange={(v) => setContext({ ...context, budget: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={getRecommendation} disabled={loading} className="w-full gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Get AI Recommendation
            </Button>
          </CardContent>
        </Card>

        {recommendation && (
          <Card className="shadow-elevated animate-scale-in border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-primary" />
                {recommendation.meal_name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center p-3 rounded-lg bg-secondary">
                  <p className="text-2xl font-bold text-foreground">{recommendation.calories}</p>
                  <p className="text-xs text-muted-foreground">Calories</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-secondary">
                  <p className="text-2xl font-bold text-foreground">{recommendation.macros.carbs}g</p>
                  <p className="text-xs text-muted-foreground">Carbs</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-secondary">
                  <p className="text-2xl font-bold text-foreground">{recommendation.macros.protein}g</p>
                  <p className="text-xs text-muted-foreground">Protein</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-secondary">
                  <p className="text-2xl font-bold text-foreground">{recommendation.macros.fats}g</p>
                  <p className="text-xs text-muted-foreground">Fats</p>
                </div>
              </div>

              {recommendation.glycemic_index && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">GI: {recommendation.glycemic_index}</Badge>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-foreground mb-2">Ingredients</p>
                <div className="flex flex-wrap gap-1.5">
                  {recommendation.ingredients.map((ing, i) => (
                    <Badge key={i} variant="secondary">{ing}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground mb-1">Why this meal?</p>
                <p className="text-sm text-muted-foreground">{recommendation.reason}</p>
              </div>

              <Button onClick={handleSaveMeal} disabled={savingMeal} variant="outline" className="w-full gap-2">
                {savingMeal ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Log This Meal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
