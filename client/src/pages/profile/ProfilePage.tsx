import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { getUserProfile, updateUserProfile } from "../../services/user.service";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Mail,
  Calendar,
  ArrowLeft,
  Pencil,
  Check,
  X,
  Loader2,
  FolderGit2,
  CheckSquare,
  GitPullRequest,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

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

interface UserProfile {
  user: {
    id: number;
    name: string;
    email: string;
    createdAt: string;
  };
  projects: Array<{
    id: number;
    name: string;
    description?: string;
    role: string;
    joinedAt: string;
  }>;
  contributions: Array<{
    id: number;
    title: string;
    status: string;
    createdAt: string;
    task: {
      id: number;
      title: string;
      project: {
        id: number;
        name: string;
      };
    };
  }>;
  tasks: Array<{
    id: number;
    title: string;
    status: string;
    project: {
      id: number;
      name: string;
    };
    assignedAt: string;
  }>;
}

function ProfilePage() {
  const { userId } = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"projects" | "tasks" | "contributions">("tasks");
  const currentUserId = getUserIdFromToken();

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await getUserProfile(Number(userId));
      setProfile(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load user profile");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    if (!profile || !userId) return;
    const trimmedName = editedName.trim();
    if (trimmedName.length < 2) {
      toast.error("Name must be at least 2 characters long");
      return;
    }
    try {
      setIsSaving(true);
      const res = await updateUserProfile(Number(userId), { name: trimmedName });
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              user: {
                ...prev.user,
                name: res.user.name,
              },
            }
          : null
      );
      toast.success("Username updated successfully");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      let msg = "Failed to update username";
      if (err && typeof err === "object" && "response" in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response;
        if (response?.data?.message) {
          msg = response.data.message;
        }
      }
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="inline-block w-5 h-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mb-2" />
        <p className="text-xs text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-16 text-center space-y-3">
        <p className="text-sm text-muted-foreground">User profile not found.</p>
        <Link to="/projects">
          <Button variant="outline" size="sm">
            Back to projects
          </Button>
        </Link>
      </div>
    );
  }

  const isSelf = currentUserId === profile.user.id;
  const initials = profile.user.name.slice(0, 2).toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to projects
      </Link>

      <div className="grid md:grid-cols-3 gap-6">
        {/* User Card Sidebar */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border/70 bg-card p-5 space-y-5">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-muted border border-border/60 flex items-center justify-center font-mono text-xl font-bold text-foreground">
                {initials}
              </div>

              <div className="space-y-1 w-full">
                {isEditing ? (
                  <div className="flex items-center gap-1.5 justify-center mt-1">
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="h-8 text-center text-xs font-semibold py-0"
                      placeholder="Enter name"
                      disabled={isSaving}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSave();
                        if (e.key === "Escape") setIsEditing(false);
                      }}
                      autoFocus
                    />
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-500/10 rounded-md transition-colors cursor-pointer"
                      title="Save name"
                    >
                      {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                      className="p-1.5 text-muted-foreground hover:bg-muted rounded-md transition-colors cursor-pointer"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1.5 group">
                    <h1 className="text-base font-semibold text-foreground">{profile.user.name}</h1>
                    {isSelf && (
                      <button
                        onClick={() => {
                          setEditedName(profile.user.name);
                          setIsEditing(true);
                        }}
                        className="p-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Edit name"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground pt-1">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[200px]">{profile.user.email}</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>Joined {new Date(profile.user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Stat Counters */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/60 text-center">
              <button
                onClick={() => setActiveTab("projects")}
                className={`p-2 rounded-md transition-colors text-left sm:text-center cursor-pointer ${
                  activeTab === "projects" ? "bg-muted" : "hover:bg-muted/50"
                }`}
              >
                <span className="block text-base font-semibold text-foreground font-mono">
                  {profile.projects.length}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Projects</span>
              </button>

              <button
                onClick={() => setActiveTab("tasks")}
                className={`p-2 rounded-md transition-colors text-left sm:text-center cursor-pointer ${
                  activeTab === "tasks" ? "bg-muted" : "hover:bg-muted/50"
                }`}
              >
                <span className="block text-base font-semibold text-foreground font-mono">
                  {profile.tasks.length}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Tasks</span>
              </button>

              <button
                onClick={() => setActiveTab("contributions")}
                className={`p-2 rounded-md transition-colors text-left sm:text-center cursor-pointer ${
                  activeTab === "contributions" ? "bg-muted" : "hover:bg-muted/50"
                }`}
              >
                <span className="block text-base font-semibold text-foreground font-mono">
                  {profile.contributions.length}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Contribs</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Tabs Area */}
        <div className="md:col-span-2 space-y-4">
          {/* Navigation Tab Bar */}
          <div className="flex items-center gap-1 border-b border-border/60 pb-2">
            <button
              onClick={() => setActiveTab("tasks")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeTab === "tasks"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              Tasks ({profile.tasks.length})
            </button>
            <button
              onClick={() => setActiveTab("contributions")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeTab === "contributions"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <GitPullRequest className="w-3.5 h-3.5" />
              Contributions ({profile.contributions.length})
            </button>
            <button
              onClick={() => setActiveTab("projects")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeTab === "projects"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              Projects ({profile.projects.length})
            </button>
          </div>

          {/* Tab 1: Tasks */}
          {activeTab === "tasks" && (
            <div className="space-y-2">
              {profile.tasks.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/70 p-8 text-center">
                  <CheckSquare className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No tasks currently assigned to this user.</p>
                </div>
              ) : (
                <div className="rounded-lg border border-border/70 bg-card divide-y divide-border/60 overflow-hidden">
                  {profile.tasks.map((task) => {
                    const statusDot =
                      task.status === "DONE"
                        ? "bg-emerald-500"
                        : task.status === "IN_PROGRESS"
                        ? "bg-amber-500"
                        : "bg-muted-foreground/50";

                    return (
                      <Link
                        key={task.id}
                        to={`/tasks/${task.id}`}
                        className="flex items-center justify-between p-3.5 hover:bg-muted/30 transition-colors group"
                      >
                        <div className="space-y-0.5 min-w-0 pr-3">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot}`} />
                            <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors truncate">
                              {task.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground pl-4">
                            {task.project.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            variant={task.status === "DONE" ? "default" : task.status === "IN_PROGRESS" ? "secondary" : "outline"}
                            className="text-[10px] py-0 px-1.5 h-4"
                          >
                            {task.status.replace("_", " ")}
                          </Badge>
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Contributions */}
          {activeTab === "contributions" && (
            <div className="space-y-2">
              {profile.contributions.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/70 p-8 text-center">
                  <GitPullRequest className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No contributions submitted yet.</p>
                </div>
              ) : (
                <div className="rounded-lg border border-border/70 bg-card divide-y divide-border/60 overflow-hidden">
                  {profile.contributions.map((cont) => {
                    const statusBadge =
                      cont.status === "APPROVED" ? (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md font-medium">
                          Approved
                        </span>
                      ) : cont.status === "REJECTED" ? (
                        <span className="text-[10px] text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded-md font-medium">
                          Rejected
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md font-medium">
                          Pending
                        </span>
                      );

                    return (
                      <Link
                        key={cont.id}
                        to={`/tasks/${cont.task.id}`}
                        className="flex items-center justify-between p-3.5 hover:bg-muted/30 transition-colors group"
                      >
                        <div className="space-y-0.5 min-w-0 pr-3">
                          <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors block truncate">
                            {cont.title}
                          </span>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {cont.task.title} • {cont.task.project.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {statusBadge}
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Projects */}
          {activeTab === "projects" && (
            <div className="space-y-2">
              {profile.projects.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/70 p-8 text-center">
                  <FolderGit2 className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Not a member of any projects.</p>
                </div>
              ) : (
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {profile.projects.map((proj) => (
                    <Link
                      key={proj.id}
                      to={`/projects/${proj.id}`}
                      className="p-3.5 rounded-lg border border-border/70 bg-card hover:border-foreground/30 transition-all flex flex-col justify-between group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {proj.name}
                          </span>
                          <Badge
                            variant={proj.role === "LEAD" ? "default" : "outline"}
                            className="text-[10px] py-0 px-1.5 h-4 shrink-0"
                          >
                            {proj.role === "LEAD" ? "Lead" : "Member"}
                          </Badge>
                        </div>
                        {proj.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-2">
                            {proj.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-3 mt-2 border-t border-border/50 text-[10px] text-muted-foreground">
                        <span>Joined {new Date(proj.joinedAt).toLocaleDateString()}</span>
                        <ExternalLink className="w-3 h-3 text-muted-foreground/50 group-hover:text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;

