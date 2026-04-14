import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getProfile, updateProfile, calculateBMI, type Profile } from "@/services/profileService";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

const DIETARY_OPTIONS = ["none", "vegetarian", "vegan", "non-veg", "halal", "kosher", "pescatarian"];
const CUISINE_OPTIONS = ["Indian", "Chinese", "Italian", "Mexican", "Japanese", "Mediterranean", "American", "Thai", "Korean"];
const HEALTH_OPTIONS = ["None", "Diabetes", "Obesity", "Heart Disease", "Hypertension", "PCOS", "Thyroid", "Celiac"];
const GOAL_OPTIONS = ["weight_loss", "muscle_gain", "maintenance", "clean_eating"];

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    fullname: "", phone: "", age: "", weight: "", height: "",
    dietary_preference: "none", goals: "maintenance",
    food_preferences: [] as string[],
    health_conditions: [] as string[],
  });

  useEffect(() => {
    if (!user) return;
    getProfile(user.id).then((p) => {
      if (p) {
        setProfile(p);
        setForm({
          fullname: p.fullname ?? "",
          phone: p.phone ?? "",
          age: p.age?.toString() ?? "",
          weight: p.weight?.toString() ?? "",
          height: p.height?.toString() ?? "",
          dietary_preference: p.dietary_preference ?? "none",
          goals: p.goals ?? "maintenance",
          food_preferences: p.food_preferences ?? [],
          health_conditions: p.health_conditions ?? [],
        });
      }
      setLoading(false);
    });
  }, [user]);

  const bmiPreview = form.weight && form.height
    ? calculateBMI(Number(form.weight), Number(form.height))
    : null;

  const toggleArray = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user.id, {
        fullname: form.fullname,
        phone: form.phone,
        age: form.age ? Number(form.age) : null,
        weight: form.weight ? Number(form.weight) : null,
        height: form.height ? Number(form.height) : null,
        dietary_preference: form.dietary_preference,
        goals: form.goals,
        food_preferences: form.food_preferences,
        health_conditions: form.health_conditions,
      });
      toast({ title: "Profile updated!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>

        <Card className="shadow-card">
          <CardHeader><CardTitle>Personal Info</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={form.fullname} onChange={(e) => setForm({ ...form, fullname: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Age</Label>
                <Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Height (cm)</Label>
                <Input type="number" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>BMI</Label>
                <div className="h-10 px-3 rounded-md border bg-muted/50 flex items-center text-foreground font-semibold">
                  {bmiPreview ?? "—"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle>Preferences</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dietary Preference</Label>
                <Select value={form.dietary_preference} onValueChange={(v) => setForm({ ...form, dietary_preference: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DIETARY_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Goal</Label>
                <Select value={form.goals} onValueChange={(v) => setForm({ ...form, goals: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GOAL_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cuisine Preferences</Label>
              <div className="flex flex-wrap gap-2">
                {CUISINE_OPTIONS.map((c) => (
                  <Badge
                    key={c}
                    variant={form.food_preferences.includes(c) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setForm({ ...form, food_preferences: toggleArray(form.food_preferences, c) })}
                  >
                    {c}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Health Conditions</Label>
              <div className="flex flex-wrap gap-2">
                {HEALTH_OPTIONS.map((h) => (
                  <Badge
                    key={h}
                    variant={form.health_conditions.includes(h) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setForm({ ...form, health_conditions: toggleArray(form.health_conditions, h) })}
                  >
                    {h}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Profile
        </Button>
      </div>
    </AppLayout>
  );
}
