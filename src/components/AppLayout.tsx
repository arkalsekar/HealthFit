import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Heart, LayoutDashboard, User, UtensilsCrossed, Sparkles, LogOut } from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/meals", label: "Meals", icon: UtensilsCrossed },
  { to: "/recommend", label: "AI Recommend", icon: Sparkles },
  { to: "/profile", label: "Profile", icon: User },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
        <div className="container flex items-center justify-between h-14 px-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">HealthFit</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to}>
                <Button
                  variant={location.pathname === item.to ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-sm">
        <div className="flex justify-around py-2">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} className="flex flex-col items-center gap-0.5 px-2 py-1">
              <item.icon className={`w-5 h-5 ${location.pathname === item.to ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-[10px] ${location.pathname === item.to ? "text-primary font-medium" : "text-muted-foreground"}`}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </nav>

      <main className="container px-4 py-6 pb-20 md:pb-6">{children}</main>
    </div>
  );
}
