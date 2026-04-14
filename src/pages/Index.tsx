import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Heart, ArrowRight, Activity, Brain, UtensilsCrossed, TrendingUp } from "lucide-react";

const features = [
  { icon: Activity, title: "Track Nutrition", desc: "Log meals and monitor your daily macro & micronutrient intake" },
  { icon: Brain, title: "AI Recommendations", desc: "Get personalized meal suggestions based on your health profile" },
  { icon: UtensilsCrossed, title: "Food Logging", desc: "Quick and easy meal tracking with detailed nutrient breakdown" },
  { icon: TrendingUp, title: "Health Dashboard", desc: "Visualize BMI, BMR, calories and nutritional progress at a glance" },
];

export default function Index() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-10" />
        <div className="container px-4 py-20 md:py-32 relative">
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">HealthFit</h1>
            </div>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Your AI-powered nutrition companion. Track meals, get personalized recommendations, and achieve your health goals smarter.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg" className="gap-2 w-full sm:w-auto">
                    Go to Dashboard <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/signup">
                    <Button size="lg" className="gap-2 w-full sm:w-auto">
                      Get Started Free <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="p-6 rounded-2xl border bg-card shadow-card hover:shadow-elevated transition-shadow animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} HealthFit. Powered by AI.
      </footer>
    </div>
  );
}
