import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getTask, updateTask, deleteTask } from "../../services/task.service";
import EditTaskDialog from "../../components/task/EditTaskDialog";
import type { Task } from "../../types/task";

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import AssignMembersDialog from "../../components/task/AssignMembersDialog";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import type { Contribution } from "../../types/contribution";
import { getTaskContributions, reviewContribution, deleteContribution } from "../../services/contribution.service";
import SubmitContributionDialog from "../../components/contribution/SubmitContributionDialog";
import { removeTaskAssignee } from "../../services/task.service";

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
  const [status, setStatus] = useState<"TODO" | "IN_PROGRESS" | "DONE" >("TODO");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [contributionSearchQuery, setContributionSearchQuery] = useState("");

  const currentUserId = getUserIdFromToken();

  const filteredContributions = contributions.filter(
    (contribution) =>
      contribution.title.toLowerCase().includes(contributionSearchQuery.toLowerCase()) ||
      (contribution.description &&
        contribution.description.toLowerCase().includes(contributionSearchQuery.toLowerCase()))
  );

  const fetchTask = async () => {
    try {
      if (!taskId) return;

      const data = await getTask(Number(taskId));
      console.log(data);
      setTask(data);
      setStatus(data.status);

      const contributionData = await getTaskContributions(Number(taskId));
      setContributions(contributionData.contributions || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (contributionId: number, status: "APPROVED" | "REJECTED") => {
    const feedback = window.prompt(`Enter feedback for this ${status.toLowerCase()} contribution (optional):`) ?? "";
    try {
      await reviewContribution(contributionId, { status, feedback });
      toast.success(`Contribution ${status.toLowerCase()} successfully`);
      fetchTask();
    } catch (error) {
      console.error(error);
      toast.error("Failed to review contribution");
    }
  };

  const handleDeleteContribution = async (e: React.MouseEvent, contributionId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this contribution?")) {
      return;
    }
    try {
      await deleteContribution(contributionId);
      toast.success("Contribution deleted successfully");
      fetchTask();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete contribution");
    }
  };

  const handleRemoveAssignee = async (userId: number) => {
    if (!window.confirm("Are you sure you want to remove this assignee from the task?")) {
      return;
    }
    try {
      if (!taskId) return;
      await removeTaskAssignee(Number(taskId), userId);
      toast.success("Assignee removed successfully");
      fetchTask();
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove assignee");
    }
  };

  const handleUpdateStatus = async () => {
    try {
      setUpdatingStatus(true);
      if (!taskId) return;
      await updateTask(Number(taskId), { status });
      toast.success("Task status updated successfully!");
      fetchTask();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update task status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      if (!taskId) return;
      await deleteTask(Number(taskId));
      toast.success("Task deleted successfully!");
      if (task) {
        navigate(`/projects/${task.project.id}`);
      } else {
        navigate(-1);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete task");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTask();
  }, [taskId]);

  if (loading) {
    return (
      <div className="container py-8">
        Loading...
      </div>
    );
  }

  if (!task) {
    return (
      <div className="container py-8">
        Task not found.
      </div>
    );
  }

  
  console.log(task);
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10 space-y-8">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
      >
        ← Back
      </Button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{task.title}</h1>

          <p className="text-muted-foreground mt-2">
            {task.description || "No description"}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2.5">
          <Badge
            variant={
              task.status === "DONE"
                ? "default"
                : task.status === "IN_PROGRESS"
                ? "secondary"
                : "outline"
            }
          >
            {task.status}
          </Badge>

          {currentUserId && task.assignees.some((member) => member.id === currentUserId) && (
            <SubmitContributionDialog
              taskId={task.id}
              assignees={task.assignees}
              currentUserId={currentUserId}
              onContributionSubmitted={fetchTask}
            />
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Created By</p>
            <p>{task.createdBy.name}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Deadline</p>
            <p>
              {task.deadline
                ? new Date(task.deadline).toLocaleDateString()
                : "No deadline"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Created At</p>
            <p>{new Date(task.createdAt).toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Members</CardTitle>
        </CardHeader>

        <CardContent>
          {task.assignees.length === 0 ? (
            <p className="text-muted-foreground">
              No members assigned.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {task.assignees.map((member) => (
                <Badge
                  key={member.id}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {member.name}
                  {task.role === "LEAD" && (
                    <button
                      onClick={() => handleRemoveAssignee(member.id)}
                      className="ml-1 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground outline-none cursor-pointer focus-visible:ring-1 focus-visible:ring-ring flex items-center justify-center w-3 h-3 text-xs font-semibold"
                      title="Remove member"
                    >
                      ×
                    </button>
                  )}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {task.role === "LEAD" && (
        <Card>
          <CardHeader>
            <CardTitle>Update Status</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "TODO" | "IN_PROGRESS" | "DONE")}
              className="h-8 w-48 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
            >
              <option value="TODO" className="dark:bg-slate-900 text-foreground">TODO</option>
              <option value="IN_PROGRESS" className="dark:bg-slate-900 text-foreground">IN PROGRESS</option>
              <option value="DONE" className="dark:bg-slate-900 text-foreground">DONE</option>
            </select>
            <Button onClick={handleUpdateStatus} disabled={updatingStatus}>
              {updatingStatus ? "Saving..." : "Save"}
            </Button>
          </CardContent>
        </Card>
      )}
      {task.role === "LEAD" && (
      <Card>

        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>

        <CardContent className="flex gap-3">
           
             <>
               <AssignMembersDialog
                 taskId={task.id}
                 projectId={task.project.id}
                 assignedMemberIds={task.assignees.map((member) => member.id)}
                 onAssigned={fetchTask}
               />
               <EditTaskDialog
                 task={task}
                 onTaskUpdated={fetchTask}
               />
               <Button variant="destructive" onClick={handleDeleteTask}>
                 Delete Task
               </Button>
             </>
           
        </CardContent>
      </Card>
      )}

      {/* Contributions Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-bold">Contributions</h2>
          {contributions.length > 5 && (
            <Input
              type="search"
              placeholder="Search contributions..."
              value={contributionSearchQuery}
              onChange={(e) => setContributionSearchQuery(e.target.value)}
              className="w-full max-w-xs bg-transparent"
            />
          )}
        </div>

        {contributions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No contributions submitted yet.
            </CardContent>
          </Card>
        ) : filteredContributions.length === 0 ? (
          <Card className="border border-dashed p-8 text-center text-muted-foreground bg-muted/10">
            No contributions match your search query.
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredContributions.map((contribution) => {
              let badgeVariant: "outline" | "default" | "destructive" = "outline";
              let badgeClass = "";
              if (contribution.status === "APPROVED") {
                badgeVariant = "default";
                badgeClass = "bg-green-600 hover:bg-green-600/80 text-white border-transparent";
              } else if (contribution.status === "REJECTED") {
                badgeVariant = "destructive";
              } else {
                badgeClass = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
              }

              return (
                <Card key={contribution.id} className="relative overflow-hidden">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-bold">
                        {contribution.title || "Contribution"}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Submitted on {new Date(contribution.createdAt).toLocaleDateString()} by{" "}
                        <span className="font-semibold text-foreground">
                          {contribution.submittedBy.name}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={badgeVariant} className={badgeClass}>
                        {contribution.status}
                      </Badge>
                      {(task.role === "LEAD" || contribution.submittedBy.id === currentUserId) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDeleteContribution(e, contribution.id)}
                          className="h-7 w-7 text-destructive hover:bg-destructive/10 cursor-pointer"
                          title="Delete contribution"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">Description</p>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {contribution.description || "No description provided."}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm pt-1 border-t border-border/50">
                      <div>
                        <span className="text-muted-foreground">GitHub Link: </span>
                        {contribution.proofUrl ? (
                          <a
                            href={contribution.proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                          >
                            View Link ↗
                          </a>
                        ) : (
                          <span className="text-muted-foreground italic">None</span>
                        )}
                      </div>

                      <div>
                        <span className="text-muted-foreground">Attachment: </span>
                        <span className="text-muted-foreground italic text-xs">None</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">Contributors</p>
                      <div className="flex flex-wrap gap-1.5">
                        {contribution.contributors.map((member) => (
                          <Badge key={member.id} variant="secondary" className="text-xs font-normal">
                            {member.name}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Reviewer Feedback if reviewed */}
                    {contribution.status !== "PENDING" && (
                      <div className="rounded-lg bg-muted/40 p-3 border border-border/50 text-sm space-y-1">
                        <p className="font-medium text-xs text-muted-foreground">
                          Reviewed by {contribution.reviewedBy?.name || "Project Lead"}
                        </p>
                        {contribution.feedback && (
                          <p className="text-foreground italic">"{contribution.feedback}"</p>
                        )}
                      </div>
                    )}

                    {/* Approve/Reject actions for project lead */}
                    {task.role === "LEAD" && contribution.status === "PENDING" && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleReview(contribution.id, "APPROVED")}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReview(contribution.id, "REJECTED")}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


export default TaskDetailsPage;