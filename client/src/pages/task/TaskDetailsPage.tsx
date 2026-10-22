import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getTask, updateTask, deleteTask, removeTaskAssignee } from "../../services/task.service";
import EditTaskDialog from "../../components/task/EditTaskDialog";
import AssignMembersDialog from "../../components/task/AssignMembersDialog";
import SubmitContributionDialog from "../../components/contribution/SubmitContributionDialog";
import { getTaskContributions, reviewContribution, deleteContribution } from "../../services/contribution.service";
import type { Task } from "../../types/task";
import type { Contribution } from "../../types/contribution";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  ArrowLeft,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Circle,
  ExternalLink,
  Trash2,
  User,
  Sparkles,
  MessageSquare,
  Search,
} from "lucide-react";
import { toast } from "sonner";

// Local JWT decoder helper
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

function TaskDetailsPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"TODO" | "IN_PROGRESS" | "DONE">("TODO");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [contributionSearchQuery, setContributionSearchQuery] = useState("");

  // Review Dialog State
  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean;
    contributionId: number | null;
    status: "APPROVED" | "REJECTED";
    feedback: string;
    submitting: boolean;
  }>({
    open: false,
    contributionId: null,
    status: "APPROVED",
    feedback: "",
    submitting: false,
  });

  const currentUserId = getUserIdFromToken();

  const fetchTaskData = useCallback(async () => {
    if (!taskId) return;
    try {
      setError(null);
      const [taskData, contribData] = await Promise.all([
        getTask(Number(taskId)),
        getTaskContributions(Number(taskId)).catch(() => ({ contributions: [] })),
      ]);
      setTask(taskData);
      setStatus(taskData.status);
      setContributions(contribData.contributions || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load task details.");
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    void fetchTaskData();
  }, [fetchTaskData]);

  const handleOpenReview = (contributionId: number, reviewStatus: "APPROVED" | "REJECTED") => {
    setReviewDialog({
      open: true,
      contributionId,
      status: reviewStatus,
      feedback: "",
      submitting: false,
    });
  };

  const handleConfirmReview = async () => {
    if (!reviewDialog.contributionId) return;
    try {
      setReviewDialog((prev) => ({ ...prev, submitting: true }));
      await reviewContribution(reviewDialog.contributionId, {
        status: reviewDialog.status,
        feedback: reviewDialog.feedback.trim(),
      });
      toast.success(
        `Contribution ${reviewDialog.status === "APPROVED" ? "approved" : "rejected"} successfully`
      );
      setReviewDialog((prev) => ({ ...prev, open: false }));
      void fetchTaskData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to review contribution");
    } finally {
      setReviewDialog((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleDeleteContribution = async (contributionId: number) => {
    if (!window.confirm("Are you sure you want to delete this contribution?")) {
      return;
    }
    try {
      await deleteContribution(contributionId);
      toast.success("Contribution deleted successfully");
      void fetchTaskData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete contribution");
    }
  };

  const handleRemoveAssignee = async (userId: number) => {
    if (!taskId) return;
    if (!window.confirm("Are you sure you want to remove this assignee from the task?")) {
      return;
    }
    try {
      await removeTaskAssignee(Number(taskId), userId);
      toast.success("Assignee removed successfully");
      void fetchTaskData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove assignee");
    }
  };

  const handleStatusChange = async (newStatus: "TODO" | "IN_PROGRESS" | "DONE") => {
    if (!taskId || newStatus === status) return;
    try {
      setUpdatingStatus(true);
      setStatus(newStatus);
      await updateTask(Number(taskId), { status: newStatus });
      toast.success("Task status updated");
      void fetchTaskData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
      if (task) setStatus(task.status);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!taskId || !task) return;
    if (!window.confirm("Are you sure you want to permanently delete this task?")) {
      return;
    }
    try {
      await deleteTask(Number(taskId));
      toast.success("Task deleted successfully");
      navigate(`/projects/${task.project.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete task");
    }
  };

  const filteredContributions = useMemo(() => {
    return contributions.filter(
      (c) =>
        c.title.toLowerCase().includes(contributionSearchQuery.toLowerCase()) ||
        (c.description &&
          c.description.toLowerCase().includes(contributionSearchQuery.toLowerCase()))
    );
  }, [contributions, contributionSearchQuery]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-36 bg-muted rounded-md animate-pulse" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 rounded-lg border border-border bg-card animate-pulse" />
          <div className="h-80 rounded-lg border border-border bg-card animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center space-y-3 max-w-md mx-auto my-12">
        <h3 className="font-semibold text-sm text-foreground">{error || "Task not found"}</h3>
        <Button size="sm" variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  const isLead = task.role === "LEAD";
  const isAssigned = currentUserId ? task.assignees.some((m) => m.id === currentUserId) : false;

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 font-medium">
          <Link to="/projects" className="hover:text-foreground transition-colors">
            Projects
          </Link>
          <span>/</span>
          <Link
            to={`/projects/${task.project.id}`}
            className="hover:text-foreground transition-colors truncate max-w-[150px] sm:max-w-xs"
          >
            {task.project.name}
          </Link>
          <span>/</span>
          <span className="text-foreground font-semibold truncate max-w-[150px] sm:max-w-sm">
            {task.title}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/projects/${task.project.id}`)}
          className="text-xs h-7 gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </Button>
      </div>

      {/* Main 2-Column Task Layout */}
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Main Column (65%): Task Content + Contributions Review Workflow */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Header Box */}
          <div className="rounded-lg border border-border bg-card p-5 sm:p-6 space-y-4 shadow-2xs">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
                {task.title}
              </h1>

              <Badge
                variant={task.status === "DONE" ? "default" : task.status === "IN_PROGRESS" ? "secondary" : "outline"}
                className={`text-[11px] shrink-0 ${
                  task.status === "DONE"
                    ? "bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
                    : ""
                }`}
              >
                {task.status === "IN_PROGRESS" ? "In Progress" : task.status}
              </Badge>
            </div>

            <div className="text-xs sm:text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed pt-1 border-t border-border/50">
              {task.description || (
                <span className="text-muted-foreground italic">No description provided for this task.</span>
              )}
            </div>
          </div>

          {/* Contributions & Evidence Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-base text-foreground">Contributions</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">
                  {contributions.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {contributions.length > 3 && (
                  <div className="relative w-44">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                      type="search"
                      placeholder="Filter..."
                      value={contributionSearchQuery}
                      onChange={(e) => setContributionSearchQuery(e.target.value)}
                      className="pl-8 h-7 text-xs bg-card"
                    />
                  </div>
                )}

                {isAssigned && currentUserId && (
                  <SubmitContributionDialog
                    taskId={task.id}
                    assignees={task.assignees}
                    currentUserId={currentUserId}
                    onContributionSubmitted={fetchTaskData}
                  />
                )}
              </div>
            </div>

            {contributions.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-card/40 p-8 text-center space-y-3">
                <Sparkles className="w-6 h-6 text-muted-foreground/60 mx-auto" />
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm text-foreground">No contributions submitted</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    {isAssigned
                      ? "You are assigned to this task. Submit your work with evidence or proof links for review."
                      : "Assigned members can submit evidence of their work here for project lead review."}
                  </p>
                </div>
                {isAssigned && currentUserId && (
                  <div className="pt-2">
                    <SubmitContributionDialog
                      taskId={task.id}
                      assignees={task.assignees}
                      currentUserId={currentUserId}
                      onContributionSubmitted={fetchTaskData}
                    />
                  </div>
                )}
              </div>
            ) : filteredContributions.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground rounded-lg border border-dashed border-border bg-muted/10">
                No contributions match your search.
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredContributions.map((contribution) => {
                  const isApproved = contribution.status === "APPROVED";
                  const isRejected = contribution.status === "REJECTED";
                  const isPending = contribution.status === "PENDING";

                  const canDelete = isLead || contribution.submittedBy.id === currentUserId;

                  return (
                    <div
                      key={contribution.id}
                      className="rounded-lg border border-border bg-card p-4 space-y-3.5 shadow-2xs hover:border-primary/30 transition-colors"
                    >
                      {/* Contribution Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-xs font-bold font-mono">
                            {contribution.submittedBy.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-sm text-foreground">
                                {contribution.title || "Contribution"}
                              </h3>
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                              by{" "}
                              <Link
                                to={`/profile/${contribution.submittedBy.id}`}
                                className="font-medium text-foreground hover:text-primary transition-colors hover:underline"
                              >
                                {contribution.submittedBy.name}
                              </Link>{" "}
                              • {new Date(contribution.createdAt).toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant={isApproved ? "default" : isRejected ? "destructive" : "secondary"}
                            className={`text-[10px] flex items-center gap-1 ${
                              isApproved
                                ? "bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
                                : isPending
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25"
                                : ""
                            }`}
                          >
                            {isApproved && <CheckCircle2 className="w-3 h-3" />}
                            {isPending && <Clock className="w-3 h-3" />}
                            {contribution.status}
                          </Badge>

                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleDeleteContribution(contribution.id)}
                              className="text-muted-foreground hover:text-destructive cursor-pointer"
                              title="Delete contribution"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      {contribution.description && (
                        <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed pl-9">
                          {contribution.description}
                        </p>
                      )}

                      {/* Meta Footer: Proof Link & Collaborators */}
                      <div className="pt-2.5 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs pl-9">
                        <div className="flex items-center gap-4">
                          {contribution.proofUrl ? (
                            <a
                              href={contribution.proofUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-primary hover:underline font-medium text-xs"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View Proof / Work
                            </a>
                          ) : (
                            <span className="text-[11px] text-muted-foreground italic">No proof URL</span>
                          )}
                        </div>

                        {contribution.contributors.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-muted-foreground">Collaborators:</span>
                            <div className="flex flex-wrap gap-1">
                              {contribution.contributors.map((c) => (
                                <Badge key={c.id} variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                                  {c.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Reviewer Feedback Callout */}
                      {!isPending && contribution.feedback && (
                        <div className="ml-9 rounded-md bg-muted/40 p-2.5 border border-border/60 text-xs space-y-1">
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                            <MessageSquare className="w-3 h-3" />
                            Feedback from {contribution.reviewedBy?.name || "Project Lead"}
                          </div>
                          <p className="text-foreground italic">"{contribution.feedback}"</p>
                        </div>
                      )}

                      {/* Lead Review Actions */}
                      {isLead && isPending && (
                        <div className="ml-9 pt-1 flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleOpenReview(contribution.id, "APPROVED")}
                            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleOpenReview(contribution.id, "REJECTED")}
                            className="h-7 text-xs cursor-pointer"
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Column (35%): Properties & Management Panel */}
        <div className="space-y-4">
          {/* Status & Assignment Box */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-4 shadow-2xs">
            {/* Status Section */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                Status
              </label>

              {isLead ? (
                <div className="flex items-center gap-2">
                  <select
                    value={status}
                    onChange={(e) => void handleStatusChange(e.target.value as "TODO" | "IN_PROGRESS" | "DONE")}
                    disabled={updatingStatus}
                    className="h-8 w-full rounded-md border border-input bg-card px-2.5 py-1 text-xs font-medium text-foreground outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {status === "DONE" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : status === "IN_PROGRESS" ? (
                    <Clock className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-xs font-semibold text-foreground">
                    {status === "IN_PROGRESS" ? "In Progress" : status}
                  </span>
                </div>
              )}
            </div>

            {/* Assignees Section */}
            <div className="pt-3 border-t border-border/60 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  Assignees ({task.assignees.length})
                </label>
                {isLead && (
                  <AssignMembersDialog
                    taskId={task.id}
                    projectId={task.project.id}
                    assignedMemberIds={task.assignees.map((m) => m.id)}
                    onAssigned={fetchTaskData}
                  />
                )}
              </div>

              {task.assignees.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-1">No members assigned.</p>
              ) : (
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                  {task.assignees.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-1.5 rounded-md hover:bg-muted/30 transition-colors text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[9px] font-mono shrink-0">
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground truncate">{member.name}</span>
                      </div>
                      {isLead && (
                        <button
                          type="button"
                          onClick={() => void handleRemoveAssignee(member.id)}
                          className="text-muted-foreground hover:text-destructive p-0.5 rounded cursor-pointer"
                          title="Remove assignee"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Task Details Metadata */}
            <div className="pt-3 border-t border-border/60 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground/80" />
                  Due Date
                </span>
                <span className="font-medium text-foreground">
                  {task.deadline
                    ? new Date(task.deadline).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "No deadline"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-muted-foreground/80" />
                  Created by
                </span>
                <span className="font-medium text-foreground">{task.createdBy.name}</span>
              </div>
            </div>

            {/* Lead Management Actions */}
            {isLead && (
              <div className="pt-3 border-t border-border/60 grid grid-cols-2 gap-2">
                <EditTaskDialog
                  task={task}
                  onTaskUpdated={fetchTaskData}
                  className="w-full text-xs h-8 cursor-pointer"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteTask}
                  className="w-full text-xs h-8 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Delete Task
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* In-App Review Dialog (replaces window.prompt) */}
      <Dialog open={reviewDialog.open} onOpenChange={(open) => !reviewDialog.submitting && setReviewDialog((prev) => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {reviewDialog.status === "APPROVED" ? "Approve Contribution" : "Reject Contribution"}
            </DialogTitle>
            <DialogDescription>
              {reviewDialog.status === "APPROVED"
                ? "Confirm approval for this contribution. You can optionally include feedback for the contributor."
                : "Explain why this contribution needs revision so the contributor can improve their submission."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <label className="text-xs font-semibold text-foreground">
              Reviewer Feedback {reviewDialog.status === "REJECTED" && <span className="text-destructive">*</span>}
            </label>
            <Textarea
              placeholder={
                reviewDialog.status === "APPROVED"
                  ? "Great job! Verified evidence and implementation details."
                  : "Please add clear proof of work or revise according to task guidelines."
              }
              value={reviewDialog.feedback}
              onChange={(e) => setReviewDialog((prev) => ({ ...prev, feedback: e.target.value }))}
              rows={3}
              className="text-xs resize-none"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReviewDialog((prev) => ({ ...prev, open: false }))}
              disabled={reviewDialog.submitting}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmReview}
              disabled={reviewDialog.submitting}
              className={reviewDialog.status === "APPROVED" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
              variant={reviewDialog.status === "REJECTED" ? "destructive" : "default"}
            >
              {reviewDialog.submitting
                ? "Submitting..."
                : reviewDialog.status === "APPROVED"
                ? "Confirm Approval"
                : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TaskDetailsPage;