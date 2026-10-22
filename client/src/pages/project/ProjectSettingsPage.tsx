import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getProject,
  regenerateInviteCode,
  leaveProject,
  updateMemberRole,
  deleteProject,
} from "../../services/project.service";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  RefreshCw,
  LogOut,
  Trash2,
  ShieldAlert,
  Award,
  UserMinus,
  Copy,
  Check,
  KeyRound,
  Users,
} from "lucide-react";

interface ProjectDetails {
  id: number;
  name: string;
  description: string;
  inviteCode: string;
  role: string;
  createdAt: string;
  createdBy: {
    id: number;
    name: string;
  };
  members: Array<{
    id: number;
    name: string;
    role: string;
  }>;
}

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

function ProjectSettingsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const currentUserId = getUserIdFromToken();
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const fetchProjectDetails = useCallback(async () => {
    if (!projectId) return;
    try {
      const data = await getProject(projectId);
      setProject(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load project details");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  const handleCopyCode = async () => {
    if (!project?.inviteCode) return;
    await navigator.clipboard.writeText(project.inviteCode);
    setCopiedCode(true);
    toast.success("Invite code copied to clipboard");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRegenerateCode = async () => {
    if (!project) return;
    setSubmitting(true);
    try {
      const data = await regenerateInviteCode(project.id);
      setProject({ ...project, inviteCode: data.inviteCode });
      toast.success("Invite code regenerated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to regenerate invite code");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLeaveProject = async () => {
    if (!project) return;
    if (!window.confirm("Are you sure you want to leave this project? You will lose access to its tasks.")) return;
    setSubmitting(true);
    try {
      await leaveProject(project.id);
      toast.success("Successfully left the project");
      navigate("/projects");
    } catch (err) {
      console.error(err);
      toast.error("Failed to leave project");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    if (
      !window.confirm(
        `Are you sure you want to permanently delete "${project.name}"? This action cannot be undone.`
      )
    )
      return;
    setSubmitting(true);
    try {
      await deleteProject(project.id);
      toast.success("Project deleted successfully");
      navigate("/projects");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete project");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMemberAction = async (memberId: number, action: "MAKE_LEAD" | "DEMOTE" | "TRANSFER") => {
    if (!project) return;
    const confirmMsg =
      action === "TRANSFER"
        ? "Are you sure you want to transfer ownership? You will no longer be the project owner."
        : action === "MAKE_LEAD"
        ? "Promote this member to co-lead?"
        : "Demote this co-lead back to member?";

    if (!window.confirm(confirmMsg)) return;

    setSubmitting(true);
    try {
      await updateMemberRole(project.id, memberId, action);
      toast.success("Member role updated successfully");
      await fetchProjectDetails();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update member role");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="inline-block w-5 h-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mb-2" />
        <p className="text-xs text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-16 text-center space-y-3">
        <p className="text-sm text-muted-foreground">Project not found or you don't have access.</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/projects")}>
          Return to projects
        </Button>
      </div>
    );
  }

  const isOwner = project.createdBy.id === currentUserId;
  const isLead = project.role === "LEAD";

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Back button & Header */}
      <div className="space-y-3">
        <Link
          to={`/projects/${project.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to {project.name}
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 pb-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Project Settings</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage invitation codes, permissions, and workspace preferences for <span className="text-foreground font-medium">{project.name}</span>
            </p>
          </div>
          <Badge variant={isOwner ? "default" : isLead ? "secondary" : "outline"} className="self-start sm:self-auto text-xs">
            {isOwner ? "Owner" : isLead ? "Co-Lead" : "Member"}
          </Badge>
        </div>
      </div>

      {/* Invite Code Section (Leads only) */}
      {isLead && (
        <section className="rounded-lg border border-border/70 bg-card overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-border/60 flex items-start gap-3">
            <div className="p-2 rounded-md bg-muted text-muted-foreground mt-0.5">
              <KeyRound className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 flex-1">
              <h2 className="text-sm font-medium text-foreground">Invite Code</h2>
              <p className="text-xs text-muted-foreground">
                Share this 6-character code with your team members so they can join this project workspace.
              </p>
            </div>
          </div>
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20">
            <div className="flex items-center gap-3">
              <span className="font-mono text-base font-semibold tracking-widest px-3 py-1.5 bg-background border border-border/70 rounded-md text-foreground shadow-xs select-all">
                {project.inviteCode}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                className="h-8 text-xs gap-1.5 cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode ? "Copied" : "Copy code"}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRegenerateCode}
              disabled={submitting}
              className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${submitting ? "animate-spin" : ""}`} />
              Regenerate code
            </Button>
          </div>
        </section>
      )}

      {/* Member Access & Roles (Owner only) */}
      {isOwner && (
        <section className="rounded-lg border border-border/70 bg-card overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-border/60 flex items-start gap-3">
            <div className="p-2 rounded-md bg-muted text-muted-foreground mt-0.5">
              <Users className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 flex-1">
              <h2 className="text-sm font-medium text-foreground">Members & Roles</h2>
              <p className="text-xs text-muted-foreground">
                Manage roles, promote co-leads to help review contributions, or transfer project ownership.
              </p>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {project.members.length} {project.members.length === 1 ? "member" : "members"}
            </span>
          </div>

          <div className="divide-y divide-border/50">
            {project.members.map((member) => {
              const memberIsOwner = member.id === project.createdBy.id;
              const memberIsLead = member.role === "LEAD";
              const initials = member.name.slice(0, 2).toUpperCase();

              return (
                <div
                  key={member.id}
                  className="p-3.5 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted border border-border/60 flex items-center justify-center font-mono text-xs font-semibold text-foreground shrink-0">
                      {initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-foreground">{member.name}</span>
                        {memberIsOwner && (
                          <span className="text-[10px] bg-foreground text-background font-medium px-1.5 py-0.2 rounded-xs">
                            Owner
                          </span>
                        )}
                        {!memberIsOwner && memberIsLead && (
                          <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4">
                            Co-Lead
                          </Badge>
                        )}
                        {!memberIsOwner && !memberIsLead && (
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 text-muted-foreground">
                            Member
                          </Badge>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {memberIsOwner ? "Original creator" : memberIsLead ? "Can review & manage tasks" : "Contributor"}
                      </span>
                    </div>
                  </div>

                  {!memberIsOwner && (
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {memberIsLead ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMemberAction(member.id, "DEMOTE")}
                          disabled={submitting}
                          className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
                        >
                          <UserMinus className="w-3 h-3" />
                          Demote
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMemberAction(member.id, "MAKE_LEAD")}
                          disabled={submitting}
                          className="h-7 text-xs text-foreground hover:bg-muted gap-1 cursor-pointer"
                        >
                          <Award className="w-3 h-3 text-sky-500" />
                          Make Co-Lead
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMemberAction(member.id, "TRANSFER")}
                        disabled={submitting}
                        className="h-7 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 cursor-pointer"
                      >
                        Transfer Owner
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Danger Zone */}
      <section className="rounded-lg border border-rose-500/30 bg-rose-500/[0.02] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-rose-500/20 flex items-start gap-3">
          <div className="p-2 rounded-md bg-rose-500/10 text-rose-500 mt-0.5">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-sm font-medium text-rose-600 dark:text-rose-400">Danger Zone</h2>
            <p className="text-xs text-muted-foreground">
              Actions that will revoke your access or permanently remove project data.
            </p>
          </div>
        </div>

        <div className="divide-y divide-rose-500/15">
          {/* Leave Project */}
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h3 className="text-xs font-semibold text-foreground">Leave Project</h3>
              <p className="text-xs text-muted-foreground">
                {isOwner
                  ? "As project owner, you must transfer ownership to another member before leaving."
                  : "Remove yourself from this project workspace. You will lose access to all tasks."}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLeaveProject}
              disabled={submitting || isOwner}
              className="h-8 text-xs border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 self-start sm:self-auto cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Leave project
            </Button>
          </div>

          {/* Delete Project (Owner only) */}
          {isOwner && (
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h3 className="text-xs font-semibold text-rose-600 dark:text-rose-400">Delete Project</h3>
                <p className="text-xs text-muted-foreground">
                  Permanently remove this project, all tasks, contributions, and historical activity. This cannot be undone.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteProject}
                disabled={submitting}
                className="h-8 text-xs gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete project
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default ProjectSettingsPage;

