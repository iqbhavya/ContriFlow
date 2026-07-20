import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getTask, updateTask, deleteTask } from "../../services/task.service";
import EditTaskDialog from "../../components/task/EditTaskDialog";
import type { Task } from "../../types/task";

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import AssignMembersDialog from "../../components/task/AssignMembersDialog";
import { toast } from "sonner";


function TaskDetailsPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"TODO" | "IN_PROGRESS" | "DONE" >("TODO");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchTask = async () => {
    try {
      if (!taskId) return;

      const data = await getTask(Number(taskId));
      console.log(data);
      setTask(data);
      setStatus(data.status);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
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
                >
                  {member.name}
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

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>

        <CardContent className="flex gap-3">
           {task.role === "LEAD" && (
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
           )}
        </CardContent>
      </Card>
    </div>
  );
}

export default TaskDetailsPage;