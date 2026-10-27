import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getProject, getProjectActivity } from "../../services/project.service";
import type { ProjectDetails } from "../../types/project";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  ArrowLeft,
  Users,
  Copy,
  Search,
  Settings as SettingsIcon,
  Calendar,
  CheckCircle2,
  Clock,
  Circle,
  Activity as ActivityIcon,
  FolderKanban,
  Check,
} from "lucide-react";
import CreateTaskDialog from "../../components/task/CreateTaskDialog";
import EditProjectDialog from "../../components/project/EditProjectDialog";
import { getProjectTasks } from "../../services/task.service";
import type { Task } from "../../types/task";
import { toast } from "sonner";
import AITaskGeneratorDialog from "../../components/task/AITaskGeneratorDialog";

interface Activity {
  type: string;
  message: string;
  timestamp: string;
}

function ProjectDetailsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskSearchQuery, setTaskSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "TODO" | "IN_PROGRESS" | "DONE">("ALL");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const fetchProjectData = useCallback(async () => {
    if (!projectId) return;
    try {
      setError(null);
      const [projData, taskData, actData] = await Promise.all([
        getProject(projectId),
        getProjectTasks(Number(projectId)).catch(() => ({ tasks: [] })),
        getProjectActivity(projectId).catch(() => []),
      ]);
      setProject(projData);
      setTasks(taskData.tasks || []);
      setActivities(actData || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load project details.");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void fetchProjectData();
  }, [fetchProjectData]);

  const handleCopyInviteCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      toast.success("Invite code copied to clipboard");
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      toast.error("Failed to copy invite code");
    }
  };

  const taskStats = useMemo(() => {
    const todo = tasks.filter((t) => t.status === "TODO").length;
    const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
    const done = tasks.filter((t) => t.status === "DONE").length;
    return { todo, inProgress, done };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(taskSearchQuery.toLowerCase()) ||
        (task.description &&
          task.description.toLowerCase().includes(taskSearchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "ALL" || task.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tasks, taskSearchQuery, statusFilter]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 bg-muted rounded-md animate-pulse" />
        <div className="h-28 rounded-lg border border-border bg-card p-6 space-y-3 animate-pulse" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 rounded-lg border border-border bg-card animate-pulse" />
          <div className="h-72 rounded-lg border border-border bg-card animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center space-y-3 max-w-md mx-auto my-12">
        <h3 className="font-semibold text-sm text-foreground">{error || "Project not found"}</h3>
        <Button size="sm" variant="outline" onClick={() => navigate("/projects")}>
          Back to Projects
        </Button>
      </div>
    );
  }

  const isLead = project.role === "LEAD";

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Projects
        </Link>

        <div className="flex items-center gap-2">
          {isLead && (
            <EditProjectDialog
              project={project}
              onProjectUpdated={fetchProjectData}
            />
          )}
          <Link to={`/projects/${project.id}/settings`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs cursor-pointer">
              <SettingsIcon className="w-3.5 h-3.5" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Project Overview Header Banner */}
      <div className="rounded-lg border border-border bg-card p-5 sm:p-6 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0 font-mono">
                {project.name.slice(0, 2).toUpperCase()}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
                {project.name}
              </h1>
              <Badge variant={isLead ? "default" : "secondary"} className="text-[10px]">
                {project.role}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {project.description || "No project description provided."}
            </p>
          </div>

          {/* Quick Invite Code Badge */}
          {project.inviteCode && (
            <div className="flex items-center gap-2 shrink-0 bg-muted/60 border border-border px-3 py-1.5 rounded-md">
              <div className="text-left">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block">
                  Invite Code
                </span>
                <span className="font-mono text-xs font-bold text-foreground">
                  {project.inviteCode}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => handleCopyInviteCode(project.inviteCode!)}
                title="Copy Invite Code"
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>
          )}
        </div>

        {/* Project Meta Strip */}
        <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-foreground/70" />
              <strong className="text-foreground">{project.members.length}</strong> members
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FolderKanban className="w-3.5 h-3.5 text-foreground/70" />
              <strong className="text-foreground">{tasks.length}</strong> tasks
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <strong className="text-foreground">{taskStats.done}</strong> completed
            </span>
          </div>

          {isLead && (
            <div className="flex items-center gap-2">
              <AITaskGeneratorDialog
                projectId={project.id}
                onTasksCreated={fetchProjectData}
              />
              <CreateTaskDialog
                projectId={project.id}
                onTaskCreated={fetchProjectData}
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Tasks & Secondary Sidebar */}
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Tasks Center */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border border-border bg-card p-4 space-y-3.5 shadow-2xs">
            {/* Tasks Header + Search + Status Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-sm text-foreground">Tasks</h2>
                <span className="text-[11px] font-medium px-2 py-0.2 rounded-full bg-secondary text-secondary-foreground border border-border">
                  {tasks.length}
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-48">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    type="search"
                    placeholder="Search tasks..."
                    value={taskSearchQuery}
                    onChange={(e) => setTaskSearchQuery(e.target.value)}
                    className="pl-8 h-7 text-xs bg-muted/30"
                  />
                </div>
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="inline-flex items-center rounded-md bg-muted/60 p-0.5 border border-border text-xs w-full sm:w-auto overflow-x-auto">
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={`px-2.5 py-1 rounded-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${statusFilter === "ALL"
                    ? "bg-card text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                All ({tasks.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("TODO")}
                className={`px-2.5 py-1 rounded-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${statusFilter === "TODO"
                    ? "bg-card text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                To Do ({taskStats.todo})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("IN_PROGRESS")}
                className={`px-2.5 py-1 rounded-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${statusFilter === "IN_PROGRESS"
                    ? "bg-card text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                In Progress ({taskStats.inProgress})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("DONE")}
                className={`px-2.5 py-1 rounded-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${statusFilter === "DONE"
                    ? "bg-card text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Done ({taskStats.done})
              </button>
            </div>

            {/* Task Rows List */}
            {tasks.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <Circle className="mx-auto w-8 h-8 text-muted-foreground/50" />
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm text-foreground">No tasks yet</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    Create actionable tasks for your team to assign members and submit evidence.
                  </p>
                </div>
                {isLead && (
                  <CreateTaskDialog
                    projectId={project.id}
                    onTaskCreated={fetchProjectData}
                  />
                )}
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground border border-dashed rounded-md bg-muted/10">
                No tasks match your filter.
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {filteredTasks.map((task) => {
                  const isDone = task.status === "DONE";
                  const isInProgress = task.status === "IN_PROGRESS";

                  return (
                    <div
                      key={task.id}
                      onClick={() => navigate(`/tasks/${task.id}`)}
                      className="group py-3 px-2 rounded-md -mx-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/40 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="mt-0.5 shrink-0">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : isInProgress ? (
                            <Clock className="w-4 h-4 text-amber-500" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>

                        <div className="space-y-0.5 min-w-0">
                          <p className={`text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate ${isDone ? "line-through text-muted-foreground" : ""
                            }`}>
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        {/* Assignees initials stack */}
                        {task.assignees.length > 0 && (
                          <div className="flex -space-x-1.5 overflow-hidden">
                            {task.assignees.slice(0, 3).map((assignee) => (
                              <div
                                key={assignee.id}
                                className="w-5 h-5 rounded-full bg-secondary border border-background text-[9px] font-bold text-foreground flex items-center justify-center font-mono"
                                title={assignee.name}
                              >
                                {assignee.name.slice(0, 2).toUpperCase()}
                              </div>
                            ))}
                            {task.assignees.length > 3 && (
                              <div className="w-5 h-5 rounded-full bg-muted border border-background text-[9px] text-muted-foreground flex items-center justify-center font-medium">
                                +{task.assignees.length - 3}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Deadline badge */}
                        {task.deadline && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Calendar className="w-3 h-3 text-muted-foreground/80" />
                            {new Date(task.deadline).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        )}

                        <Badge
                          variant={isDone ? "default" : isInProgress ? "secondary" : "outline"}
                          className={`text-[10px] ${isDone ? "bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : ""
                            }`}
                        >
                          {task.status === "IN_PROGRESS" ? "In Progress" : task.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Members & Activity Sidebar */}
        <div className="space-y-4">
          {/* Members Panel */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <h3 className="font-semibold text-xs tracking-tight text-foreground flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                Team Members ({project.members.length})
              </h3>
            </div>

            <div className="space-y-1.5 max-h-[260px] overflow-y-auto">
              {project.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-muted/40 transition-colors"
                >
                  <Link
                    to={`/profile/${member.id}`}
                    className="flex items-center gap-2 min-w-0 hover:text-primary transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-[10px] font-bold font-mono shrink-0">
                      {member.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-foreground truncate">
                      {member.name}
                    </span>
                  </Link>

                  <Badge
                    variant={member.role === "LEAD" ? "default" : "secondary"}
                    className="text-[9px] scale-90"
                  >
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Panel */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <h3 className="font-semibold text-xs tracking-tight text-foreground flex items-center gap-1.5">
                <ActivityIcon className="w-3.5 h-3.5 text-muted-foreground" />
                Recent Activity
              </h3>
              {activities.length > 5 && (
                <button
                  type="button"
                  onClick={() => setIsActivityDialogOpen(true)}
                  className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                >
                  View all
                </button>
              )}
            </div>

            {activities.length === 0 ? (
              <p className="text-xs text-muted-foreground py-3 text-center">
                No recent activity recorded.
              </p>
            ) : (
              <div className="space-y-2.5">
                {activities.slice(0, 5).map((act, index) => (
                  <div key={index} className="text-xs flex items-start gap-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground text-xs font-medium break-words">
                        {act.message}
                      </p>
                      <span className="block text-[10px] text-muted-foreground/75 mt-0.5">
                        {new Date(act.timestamp).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        at{" "}
                        {new Date(act.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Activity Dialog */}
      <Dialog open={isActivityDialogOpen} onOpenChange={setIsActivityDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Recent Activity Log</DialogTitle>
            <DialogDescription>
              Chronological log of events recorded for {project.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            {activities.map((act, index) => (
              <div
                key={index}
                className="text-xs flex items-start gap-2.5 pb-2.5 border-b border-border/50 last:border-0 last:pb-0"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-medium leading-relaxed">
                    {act.message}
                  </p>
                  <span className="block text-[10px] text-muted-foreground/80 mt-0.5">
                    {new Date(act.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProjectDetailsPage;
