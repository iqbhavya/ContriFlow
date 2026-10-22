import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProjects } from "../../services/project.service";
import CreateProjectDialog from "../../components/project/CreateProjectDialog";
import JoinProjectDialog from "../../components/project/JoinProjectDialog";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import type { Project } from "../../types/project";
import { Search, FolderKanban, ArrowRight, ShieldAlert, Sparkles, X } from "lucide-react";

function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "LEAD" | "MEMBER">("ALL");

  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      setError(null);
      const data = await getMyProjects();
      setProjects(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch projects. Please check your network and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProjects();
  }, []);

  const leadCount = useMemo(() => projects.filter((p) => p.role === "LEAD").length, [projects]);
  const memberCount = useMemo(() => projects.filter((p) => p.role === "MEMBER").length, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.description &&
          project.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesRole =
        roleFilter === "ALL" || project.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [projects, searchQuery, roleFilter]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
          <div className="space-y-1">
            <div className="h-7 w-32 bg-muted rounded-md animate-pulse" />
            <div className="h-4 w-48 bg-muted rounded-md animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-muted rounded-md animate-pulse" />
            <div className="h-8 w-24 bg-muted rounded-md animate-pulse" />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-lg border border-border bg-card p-4 space-y-3 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="h-5 w-24 bg-muted rounded-sm" />
                <div className="h-4 w-12 bg-muted rounded-sm" />
              </div>
              <div className="h-4 w-full bg-muted rounded-sm" />
              <div className="h-4 w-2/3 bg-muted rounded-sm" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center space-y-3 max-w-md mx-auto my-12">
        <ShieldAlert className="w-8 h-8 text-destructive mx-auto" />
        <h3 className="font-semibold text-sm text-foreground">Error Loading Projects</h3>
        <p className="text-xs text-muted-foreground">{error}</p>
        <Button size="sm" variant="outline" onClick={() => void fetchProjects()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Projects</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">
              {projects.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage your project workspaces, tasks, and team contributions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <JoinProjectDialog onProjectJoined={fetchProjects} />
          <CreateProjectDialog onProjectCreated={fetchProjects} />
        </div>
      </div>

      {projects.length === 0 ? (
        /* Empty State */
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 sm:p-12 text-center max-w-lg mx-auto my-8 space-y-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-base text-foreground">No projects yet</h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
              Get started by creating a new project workspace for your team, or join an existing project using an invite code.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <CreateProjectDialog onProjectCreated={fetchProjects} />
            <JoinProjectDialog onProjectJoined={fetchProjects} />
          </div>
        </div>
      ) : (
        <>
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Filter projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-card"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Role Filter Tabs */}
            <div className="inline-flex items-center rounded-lg bg-muted/60 p-0.5 border border-border text-xs">
              <button
                type="button"
                onClick={() => setRoleFilter("ALL")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  roleFilter === "ALL"
                    ? "bg-card text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All ({projects.length})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter("LEAD")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  roleFilter === "LEAD"
                    ? "bg-card text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Lead ({leadCount})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter("MEMBER")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  roleFilter === "MEMBER"
                    ? "bg-card text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Member ({memberCount})
              </button>
            </div>
          </div>

          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-xs text-muted-foreground bg-muted/20">
              No projects match your search query or filter.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="group relative flex flex-col justify-between rounded-lg border border-border bg-card p-4 hover:border-primary/40 hover:shadow-xs transition-all cursor-pointer"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                          {project.name.slice(0, 2).toUpperCase()}
                        </div>
                        <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                          {project.name}
                        </h3>
                      </div>
                      <Badge
                        variant={project.role === "LEAD" ? "default" : "secondary"}
                        className="text-[10px] shrink-0"
                      >
                        {project.role}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {project.description || "No project description provided."}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FolderKanban className="w-3.5 h-3.5 text-muted-foreground/70" />
                      Workspace
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium text-foreground/80 group-hover:text-primary group-hover:translate-x-0.5 transition-all">
                      Open <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ProjectsPage;
