import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/button";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import NotificationsDropdown from "./NotificationsDropdown";

const getUserIdFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.userId as number;
  } catch {
    return null;
  }
};

function AppLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const currentUserId = getUserIdFromToken();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur-sm support-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <Link to="/projects" className="flex items-center space-x-2 font-bold text-xl tracking-tight text-primary">
              <span className="text-xl">⚡</span>
              <span>ContriFlow</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link to="/projects" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Projects
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <NotificationsDropdown />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8 rounded-full cursor-pointer"
              title="Toggle Theme"
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4 text-foreground/80" />
              ) : (
                <Sun className="h-4 w-4 text-foreground/80" />
              )}
            </Button>
            {currentUserId && (
              <Link
                to={`/profile/${currentUserId}`}
                className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all flex items-center justify-center text-xs font-bold font-mono"
                title="View Profile"
              >
                U
              </Link>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="cursor-pointer">
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}

export default AppLayout;
