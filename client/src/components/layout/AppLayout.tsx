import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/button";
import { Sun, Moon, LogOut, User, FolderKanban, Menu, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import NotificationsDropdown from "./NotificationsDropdown";
import ContriFlowLogo from "../common/ContriFlowLogo";

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
  const location = useLocation();
  const currentUserId = getUserIdFromToken();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isProjectsActive = location.pathname.startsWith("/projects");
  const isProfileActive = currentUserId ? location.pathname.startsWith(`/profile/${currentUserId}`) : false;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased">
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link to="/projects" className="flex items-center gap-2.5 font-bold text-base tracking-tight text-foreground hover:opacity-90 transition-opacity">
              <ContriFlowLogo className="h-7 w-7" />
              <span className="font-semibold text-sm sm:text-base tracking-tight">ContriFlow</span>
            </Link>

            <nav className="hidden sm:flex items-center space-x-1 text-xs font-medium">
              <Link
                to="/projects"
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                  isProjectsActive
                    ? "bg-secondary text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <FolderKanban className="w-3.5 h-3.5" />
                Projects
              </Link>
            </nav>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <NotificationsDropdown />

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
              title="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>

            <div className="h-4 w-[1px] bg-border mx-1" />

            {currentUserId && (
              <Link
                to={`/profile/${currentUserId}`}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors ${
                  isProfileActive
                    ? "bg-secondary text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                title="View Profile"
              >
                <div className="w-5 h-5 rounded-full bg-primary/15 border border-primary/25 text-primary flex items-center justify-center text-[10px] font-bold font-mono">
                  <User className="w-3 h-3" />
                </div>
                <span>Profile</span>
              </Link>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer h-7 px-2.5"
            >
              <LogOut className="w-3.5 h-3.5 mr-1" />
              Sign Out
            </Button>
          </div>

          <div className="flex sm:hidden items-center gap-1">
            <NotificationsDropdown />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-foreground cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-border px-4 py-3 space-y-2 bg-card animate-in slide-in-from-top-2">
            <Link
              to="/projects"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                isProjectsActive ? "bg-secondary font-semibold" : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              Projects
            </Link>
            {currentUserId && (
              <Link
                to={`/profile/${currentUserId}`}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                  isProfileActive ? "bg-secondary font-semibold" : "text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <User className="w-4 h-4" />
                My Profile
              </Link>
            )}
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="text-xs flex items-center gap-1.5"
              >
                {theme === "light" ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                {theme === "light" ? "Dark mode" : "Light mode"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-xs text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-3.5 h-3.5 mr-1" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}

export default AppLayout;
