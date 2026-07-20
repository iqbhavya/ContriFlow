import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getTask } from "../../services/task.service";
import type { Task } from "../../types/task";

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import AssignMembersDialog from "../../components/task/AssignMembersDialog";


function TaskDetailsPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTask = async () => {
    try {
      if (!taskId) return;

      const data = await getTask(Number(taskId));
      console.log(data);
      setTask(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
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

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>

        <CardContent className="flex gap-3">
           {task.role === "LEAD" && (
                <AssignMembersDialog
                    taskId={task.id}
                    projectId={task.project.id}
                    assignedMemberIds={task.assignees.map((member) => member.id)}
                    onAssigned={fetchTask}
                />
            )}
          

          <Button variant="outline">
            Edit Task
          </Button>

          <Button variant="destructive">
            Delete Task
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default TaskDetailsPage;