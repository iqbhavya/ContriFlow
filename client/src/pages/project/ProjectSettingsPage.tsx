import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getProject,
  regenerateInviteCode,
  leaveProject,
  updateMemberRole,
  deleteProject,
} from "../../services/project.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, RefreshCw, LogOut, Trash2, ShieldAlert, Award, UserMinus } from "lucide-react";

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

  const fetchProjectDetails = async () => {
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
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjectDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

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
    if (!window.confirm("Are you sure you want to leave this project?")) return;
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
    if (!window.confirm("WARNING: This will permanently delete the project and all tasks/contributions. Are you absolutely sure?")) return;
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
        ? "Are you sure you want to transfer ownership? You will no longer be the owner."
        : action === "MAKE_LEAD"
        ? "Promote this member to co-lead?"
        : "Demote this co-lead to member?";

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
    return <div className="py-12 text-center text-muted-foreground text-sm">Loading settings...</div>;
  }

  if (!project) {
    return <div className="py-12 text-center text-muted-foreground text-sm">Project not found.</div>;
  }

  const isOwner = project.createdBy.id === currentUserId;
  const isLead = project.role === "LEAD";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link
        to={`/projects/${project.id}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Project
      </Link>

      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Project Settings</h1>
        <p className="text-muted-foreground text-sm">Configure settings and member permissions for {project.name}.</p>
      </div>

      <div className="grid gap-6">
        {isLead && (
          <Card>
            <CardHeader>
              <CardTitle>Invite Settings</CardTitle>
              <CardDescription>Share this code to let others join this project.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-muted rounded-lg font-mono text-lg font-bold tracking-wider border">
                  {project.inviteCode}
                </div>
                <Button
                  variant="outline"
                  onClick={handleRegenerateCode}
                  disabled={submitting}
                  className="gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${submitting ? "animate-spin" : ""}`} />
                  Regenerate Code
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isOwner && (
          <Card>
            <CardHeader>
              <CardTitle>Member Access & Roles</CardTitle>
              <CardDescription>Manage roles, promote co-leads, or transfer project ownership.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {project.members.map((member) => {
                  const memberIsOwner = member.id === project.createdBy.id;
                  const memberIsLead = member.role === "LEAD";

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border rounded-xl bg-muted/10 hover:border-primary/20 transition-all"
                    >
                      <div className="space-y-0.5">
                        <span className="font-semibold text-sm block text-foreground">{member.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={memberIsOwner ? "default" : memberIsLead ? "secondary" : "outline"} className="text-[10px] scale-95 origin-left">
                            {memberIsOwner ? "Owner" : memberIsLead ? "Co-Lead" : "Member"}
                          </Badge>
                        </div>
                      </div>

                      {!memberIsOwner && (
                        <div className="flex items-center gap-2">
                          {memberIsLead ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMemberAction(member.id, "DEMOTE")}
                              disabled={submitting}
                              className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              <UserMinus className="w-3.5 h-3.5 mr-1" />
                              Demote
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMemberAction(member.id, "MAKE_LEAD")}
                              disabled={submitting}
                              className="text-xs text-primary hover:text-primary/80 cursor-pointer"
                            >
                              <Award className="w-3.5 h-3.5 mr-1" />
                              Make Co-Lead
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMemberAction(member.id, "TRANSFER")}
                            disabled={submitting}
                            className="text-xs text-amber-600 hover:text-amber-500 cursor-pointer"
                          >
                            Transfer Owner
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-destructive" />
              Danger Zone
            </CardTitle>
            <CardDescription>Irreversible actions for this project.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-b last:border-0 border-border/60">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">Leave Project</h4>
                <p className="text-xs text-muted-foreground">Depart from this project workspace. Original owners cannot leave.</p>
              </div>
              <Button
                variant="destructive"
                onClick={handleLeaveProject}
                disabled={submitting || isOwner}
                className="gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Leave Project
              </Button>
            </div>

            {isOwner && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 last:border-0">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-destructive">Delete Project</h4>
                  <p className="text-xs text-muted-foreground">Permanently delete this project along with all task and contribution histories.</p>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleDeleteProject}
                  disabled={submitting}
                  className="gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Project
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProjectSettingsPage;
