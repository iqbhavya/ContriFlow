import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  FolderKanban,
  CheckSquare,
  GitPullRequest,
  Users,
  Activity,
  Bell,
  ArrowRight,
  Check,
  X,
  Calendar,
  KeyRound,
  Menu,
  Award,
  Sparkles,
} from "lucide-react";
import ContriFlowLogo from "../../components/common/ContriFlowLogo";

function LinkedinIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.69 1.69 0 1 0 0-3.38 1.69 1.69 0 0 0 0 3.38m1.4 9.74V9.89H5.06v8.61h2.8z" />
    </svg>
  );
}

export default function LandingPage() {
  const { token, authLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If user is already authenticated, redirect them to the projects workspace
  if (!authLoading && token) {
    return <Navigate to="/projects" replace />;
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-foreground">
      {/* ── Section 1: Navigation Bar ───────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 font-bold text-base tracking-tight text-foreground hover:opacity-90 transition-opacity"
          >
            <ContriFlowLogo className="h-7 w-7" />
            <span className="font-semibold text-sm sm:text-base tracking-tight">ContriFlow</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-muted-foreground">
            <a
              href="#how-it-works"
              className="hover:text-foreground transition-colors"
            >
              How It Works
            </a>
            <a
              href="#features"
              className="hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#who-is-it-for"
              className="hover:text-foreground transition-colors"
            >
              Who It's For
            </a>
          </nav>

          {/* Desktop Auth CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-xs h-8 px-3 cursor-pointer">
                Log in
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="text-xs h-8 px-3.5 font-medium cursor-pointer shadow-xs">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex sm:hidden items-center">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-foreground cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-border px-4 py-3 space-y-2 bg-card animate-in slide-in-from-top-2">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
            >
              How It Works
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
            >
              Features
            </a>
            <a
              href="#who-is-it-for"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
            >
              Who It's For
            </a>
            <div className="pt-2 border-t border-border/60 flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full text-xs h-8 cursor-pointer">
                  Log in
                </Button>
              </Link>
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" className="w-full text-xs h-8 font-medium cursor-pointer">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Container */}
      <main className="flex-1">
        {/* ── Section 2: Hero Section ────────────────────────────────── */}
        <section className="pt-16 pb-12 sm:pt-24 sm:pb-16 text-center max-w-4xl mx-auto px-4 sm:px-6">
          {/* Subtle Tagline Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/80 bg-muted/40 text-[11px] font-medium text-muted-foreground mb-6 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span>Collaboration platform for student teams & clubs</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground leading-[1.15] max-w-3xl mx-auto">
            Good work deserves to be seen.
          </h1>

          {/* Supporting Description */}
          <p className="mt-4 sm:mt-5 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            ContriFlow helps clubs and project teams organize their work, assign tasks, review contributions, and keep everyone on the same page.
          </p>

          {/* Hero Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-10 px-5 text-xs sm:text-sm font-medium gap-2 cursor-pointer shadow-xs">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-10 px-5 text-xs sm:text-sm font-medium cursor-pointer">
                See How It Works
              </Button>
            </a>
          </div>

          {/* Audience Subtext */}
          <p className="mt-4 text-xs text-muted-foreground/75">
            Built for student clubs, collaborative projects, and teams that get things done.
          </p>
        </section>

        {/* ── Section 3: Product Preview (Interactive Mockup) ───────── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-20 sm:mb-28">
          <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-sm">
            {/* Mockup Window Header Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/70 bg-muted/40 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                </div>
                <span className="text-[11px] font-mono text-muted-foreground pl-2 hidden sm:inline">
                  contriflow.app / projects / acm-web-2026
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Live Workspace</span>
              </div>
            </div>

            {/* Mockup Workspace Header */}
            <div className="p-4 sm:p-6 border-b border-border/60 bg-muted/10 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-base sm:text-lg font-semibold text-foreground tracking-tight">
                      ACM Web Development 2026
                    </h2>
                    <Badge variant="default" className="text-[10px] py-0 px-2 h-4 font-mono">
                      Lead
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Building the flagship technical portal and event registration system for the annual club symposium.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background border border-border text-xs font-mono text-foreground shadow-2xs">
                    <KeyRound className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>ACM-842</span>
                  </div>
                  <Button size="sm" className="h-7 text-xs px-2.5 cursor-default pointer-events-none">
                    + New Task
                  </Button>
                </div>
              </div>

              {/* Mockup Project Meta Strip */}
              <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> 6 members
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Created Jan 15
                </span>
                <span>•</span>
                <span>Lead: Alex Rivera</span>
              </div>
            </div>

            {/* Mockup Workspace Body: 2-Column Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border/60">
              {/* Left Column: Tasks Section (2 Cols) */}
              <div className="lg:col-span-2 p-4 sm:p-5 space-y-4">
                {/* Task Filter Pills */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="px-2.5 py-1 rounded-md bg-foreground text-background font-medium">
                      All (5)
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-muted-foreground hover:bg-muted/50">
                      To Do (1)
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-muted-foreground hover:bg-muted/50">
                      In Progress (2)
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-muted-foreground hover:bg-muted/50">
                      Done (2)
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono hidden sm:inline">
                    3 active assignees
                  </span>
                </div>

                {/* Task Item 1: Done */}
                <div className="p-3 rounded-lg border border-border/70 bg-card hover:border-border transition-colors flex items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-xs font-medium text-foreground truncate">
                        Implement JWT auth middleware & session token verification
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground pl-4">
                      <span>Task #12</span>
                      <span>•</span>
                      <span className="text-emerald-500/90 font-medium">2 contributions approved</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex -space-x-1.5">
                      <div className="w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center text-[9px] font-mono font-bold">
                        AR
                      </div>
                      <div className="w-5 h-5 rounded-full bg-primary/20 border border-border flex items-center justify-center text-[9px] font-mono font-bold text-primary">
                        SK
                      </div>
                    </div>
                    <Badge variant="default" className="text-[10px] py-0 px-1.5 h-4">
                      Done
                    </Badge>
                  </div>
                </div>

                {/* Task Item 2: In Progress */}
                <div className="p-3 rounded-lg border border-border/70 bg-card hover:border-border transition-colors flex items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      <span className="text-xs font-medium text-foreground truncate">
                        Design contribution review feed and status filters
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground pl-4">
                      <span>Task #14</span>
                      <span>•</span>
                      <span className="text-amber-500/90 font-medium">Due in 2 days</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center text-[9px] font-mono font-bold">
                      MC
                    </div>
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4">
                      In Progress
                    </Badge>
                  </div>
                </div>

                {/* Task Item 3: To Do */}
                <div className="p-3 rounded-lg border border-border/70 bg-card hover:border-border transition-colors flex items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/50 shrink-0" />
                      <span className="text-xs font-medium text-foreground truncate">
                        Set up automated email alerts and webhook notifications
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground pl-4">
                      <span>Task #15</span>
                      <span>•</span>
                      <span>No deadline</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center text-[9px] font-mono font-bold">
                      AR
                    </div>
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4">
                      To Do
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Right Column: Review Queue & Recent Activity (1 Col) */}
              <div className="p-4 sm:p-5 space-y-5 bg-muted/15">
                {/* Review Queue Preview Card */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <GitPullRequest className="w-3.5 h-3.5 text-amber-500" />
                      Review Queue
                    </h3>
                    <span className="text-[10px] font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.2 rounded border border-amber-500/20 font-medium">
                      1 Pending
                    </span>
                  </div>

                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/[0.03] p-3 space-y-2">
                    <div className="space-y-0.5">
                      <span className="text-xs font-medium text-foreground block">
                        Refactor API client to Axios instance with interceptors
                      </span>
                      <p className="text-[10px] text-muted-foreground">
                        Submitted by Marcus Chen for Task #14
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <div className="flex-1 py-1 px-2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium flex items-center justify-center gap-1 border border-emerald-500/20">
                        <Check className="w-3 h-3" /> Approve
                      </div>
                      <div className="flex-1 py-1 px-2 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-medium flex items-center justify-center gap-1 border border-rose-500/20">
                        <X className="w-3 h-3" /> Reject
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Feed Miniature */}
                <div className="space-y-2.5 pt-2 border-t border-border/50">
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                    Recent Activity
                  </h3>

                  <div className="space-y-2 text-[11px]">
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div>
                        <span className="text-foreground font-medium">Alex Rivera</span>{" "}
                        <span className="text-muted-foreground">approved contribution for Task #12</span>
                        <div className="text-[10px] text-muted-foreground/75">18m ago</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 mt-1.5 shrink-0" />
                      <div>
                        <span className="text-foreground font-medium">Marcus Chen</span>{" "}
                        <span className="text-muted-foreground">submitted contribution for Task #14</span>
                        <div className="text-[10px] text-muted-foreground/75">1h ago</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 mt-1.5 shrink-0" />
                      <div>
                        <span className="text-foreground font-medium">Sarah Kim</span>{" "}
                        <span className="text-muted-foreground">joined project via invite code</span>
                        <div className="text-[10px] text-muted-foreground/75">4h ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 4: How It Works ────────────────────────────────── */}
        <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 border-t border-border/60">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              How ContriFlow works
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              A straightforward, transparent workflow designed from the ground up for collaborative team execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="rounded-lg border border-border/70 bg-card p-5 sm:p-6 space-y-3 relative flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                    01
                  </span>
                  <FolderKanban className="w-4 h-4 text-muted-foreground" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">
                  Create a project
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Set up a project for your club, event, hackathon, or team initiative. Invite members using the existing project joining workflow.
                </p>
              </div>

              <div className="pt-3 border-t border-border/50 text-[11px] text-muted-foreground font-mono flex items-center justify-between">
                <span>Unique 6-char code</span>
                <span className="text-foreground font-semibold">Instant Join</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-lg border border-border/70 bg-card p-5 sm:p-6 space-y-3 relative flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                    02
                  </span>
                  <CheckSquare className="w-4 h-4 text-muted-foreground" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">
                  Assign and complete tasks
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Break work into tasks, assign members, and keep track of progress and task status from start to finish.
                </p>
              </div>

              <div className="pt-3 border-t border-border/50 text-[11px] text-muted-foreground font-mono flex items-center justify-between">
                <span>Status tracking</span>
                <span className="text-foreground font-semibold">To Do → Done</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-lg border border-border/70 bg-card p-5 sm:p-6 space-y-3 relative flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                    03
                  </span>
                  <GitPullRequest className="w-4 h-4 text-muted-foreground" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">
                  Submit and review contributions
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Members submit their work for review. Project leaders can review contributions and approve or reject them.
                </p>
              </div>

              <div className="pt-3 border-t border-border/50 text-[11px] text-muted-foreground font-mono flex items-center justify-between">
                <span>Review decisions</span>
                <span className="text-foreground font-semibold">Feedback & Notes</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 5: Features ────────────────────────────────────── */}
        <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 border-t border-border/60">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Built for real teamwork
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Every tool and view in ContriFlow addresses authentic collaboration needs for clubs and student committees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: Project Management */}
            <div className="rounded-lg border border-border/70 bg-card p-5 space-y-2.5">
              <div className="w-8 h-8 rounded-md bg-muted text-foreground flex items-center justify-center">
                <FolderKanban className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Project management</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Keep team projects organized with role-based permissions, distinct workspaces, and 6-character invite codes for painless onboarding.
              </p>
            </div>

            {/* Feature 2: Task Assignment */}
            <div className="rounded-lg border border-border/70 bg-card p-5 space-y-2.5">
              <div className="w-8 h-8 rounded-md bg-muted text-foreground flex items-center justify-center">
                <CheckSquare className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Task assignment</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Assign multiple members to tasks, specify optional due dates, and monitor status updates across To Do, In Progress, and Done.
              </p>
            </div>

            {/* Feature 3: Contribution Reviews */}
            <div className="rounded-lg border border-border/70 bg-card p-5 space-y-2.5">
              <div className="w-8 h-8 rounded-md bg-muted text-foreground flex items-center justify-center">
                <GitPullRequest className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Contribution reviews</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Team members submit completed work for review. Leads inspect submissions and provide constructive approval or revision feedback.
              </p>
            </div>

            {/* Feature 4: Team Collaboration */}
            <div className="rounded-lg border border-border/70 bg-card p-5 space-y-2.5">
              <div className="w-8 h-8 rounded-md bg-muted text-foreground flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Team collaboration</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Manage roles and permissions. Promote members to Co-Leads to share review duties or transfer project ownership when transitions occur.
              </p>
            </div>

            {/* Feature 5: Activity Tracking */}
            <div className="rounded-lg border border-border/70 bg-card p-5 space-y-2.5">
              <div className="w-8 h-8 rounded-md bg-muted text-foreground flex items-center justify-center">
                <Activity className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Activity tracking</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Follow chronological project events and team updates. See who joined, when tasks were assigned, and what contributions were reviewed.
              </p>
            </div>

            {/* Feature 6: Notifications */}
            <div className="rounded-lg border border-border/70 bg-card p-5 space-y-2.5">
              <div className="w-8 h-8 rounded-md bg-muted text-foreground flex items-center justify-center">
                <Bell className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Stay informed with in-app notifications whenever someone submits a contribution, requests a review, or updates your assigned tasks.
              </p>
            </div>
          </div>
        </section>

        {/* ── Section 6: Who is it for? ──────────────────────────────── */}
        <section id="who-is-it-for" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 border-t border-border/60">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Use Cases
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Who is ContriFlow for?
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Designed for student organizations and collaborative teams that value accountability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="rounded-lg border border-border/70 bg-card p-5 sm:p-6 space-y-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Award className="w-4 h-4 text-primary shrink-0" />
                College clubs & student committees
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Coordinate technical, design, logistics, and editorial teams across academic terms without losing track of who delivered what.
              </p>
            </div>

            <div className="rounded-lg border border-border/70 bg-card p-5 sm:p-6 space-y-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary shrink-0" />
                Hackathon & academic project teams
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Clearly distribute tasks, keep deliverables on schedule during tight sprints, and maintain an organized record of team contributions.
              </p>
            </div>

            <div className="rounded-lg border border-border/70 bg-card p-5 sm:p-6 space-y-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary shrink-0" />
                Event organizing teams
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Manage logistics, sponsorships, marketing material approvals, and volunteer assignments with clear ownership and due dates.
              </p>
            </div>

            <div className="rounded-lg border border-border/70 bg-card p-5 sm:p-6 space-y-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-primary shrink-0" />
                Small collaborative teams
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Lightweight enough for a 3-person weekend project, yet structured enough to scale cleanly as your team grows.
              </p>
            </div>
          </div>
        </section>

        {/* ── Section 7: Final Call to Action ────────────────────────── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="rounded-xl border border-border/80 bg-card p-8 sm:p-12 text-center space-y-5 shadow-xs">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Make every contribution count.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Bring your team, tasks, and contributions together in one place.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-10 px-6 text-xs sm:text-sm font-medium gap-2 cursor-pointer shadow-xs">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div>
              <Link
                to="/login"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-block pt-1"
              >
                Already have an account? <span className="text-foreground font-medium underline underline-offset-4">Log in</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Section 8: Footer ───────────────────────────────────────── */}
      <footer className="border-t border-border/70 bg-card/50 py-10 text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <Link to="/" className="flex items-center gap-2 font-bold text-sm text-foreground">
                <ContriFlowLogo className="h-5 w-5" />
                <span>ContriFlow</span>
              </Link>
              <p className="text-[11px] text-muted-foreground">
                Collaborative project and contribution tracking for student clubs and teams.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-muted-foreground text-xs">
              <a href="#how-it-works" className="hover:text-foreground transition-colors">
                How It Works
              </a>
              <a href="#features" className="hover:text-foreground transition-colors">
                Features
              </a>
              <Link to="/login" className="hover:text-foreground transition-colors">
                Log in
              </Link>
              <Link to="/signup" className="hover:text-foreground transition-colors">
                Sign Up
              </Link>
              <a
                href="https://www.linkedin.com/in/iqbhavya"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors inline-flex items-center gap-1.5 text-primary hover:underline font-medium"
              >
                <LinkedinIcon className="w-3.5 h-3.5 text-[#0A66C2]" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>

          <div className="pt-4 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-muted-foreground">
            <p>© {currentYear} ContriFlow. All rights reserved.</p>
            <p>
              Created by{" "}
              <a
                href="https://www.linkedin.com/in/iqbhavya"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:underline font-medium inline-flex items-center gap-1"
              >
                Bhavya
                <LinkedinIcon className="w-3 h-3 text-[#0A66C2]" />
              </a>{" "}
              • Designed for clubs, hackathons, and collaborative teams.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
