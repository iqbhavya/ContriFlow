import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";

import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";

import { assignTask, getProjectMembers } from "@/services/task.service";

type ProjectMember = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type AssignMembersDialogProps = {
    taskId: number;
    projectId: number;
    assignedMemberIds: number[];
    onAssigned: () => void;
};

export default function AssignMembersDialog({
  taskId,
  projectId,
  assignedMemberIds,
  onAssigned,
}: AssignMembersDialogProps) {
  const [open, setOpen] = useState(false);

  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);

  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const fetchMembers = async () => {
    try {
      setLoading(true);

      const data = await getProjectMembers(projectId);
      
      const availableMembers = data.filter(
            (member: ProjectMember) =>
                !assignedMemberIds.includes(member.id)
    );
      setMembers(availableMembers);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchMembers();
    }
  }, [open]);

  const toggleMember = (memberId: number) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleAssign = async () => {
    try {
      setAssigning(true);

      await assignTask(taskId, selectedMembers);

      setSelectedMembers([]);
      setOpen(false);

      onAssigned();
    } catch (error) {
      console.error(error);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);

        if (!value) {
          setSelectedMembers([]);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>Assign Members</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Members</DialogTitle>

          <DialogDescription>
            Select one or more project members to assign to this task.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-muted-foreground">
              Loading members...
            </p>
          ) : members.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No members found.
            </p>
          ) : (
            members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{member.name}</p>

                  <p className="text-sm text-muted-foreground">
                    {member.email}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {member.role}
                  </p>
                </div>

                <Checkbox
                  checked={selectedMembers.includes(member.id)}
                  onCheckedChange={() => toggleMember(member.id)}
                />
              </div>
            ))
          )}
        </div>

        <Button
          onClick={handleAssign}
          disabled={
            assigning ||
            loading ||
            selectedMembers.length === 0
          }
          className="w-full"
        >
          {assigning ? "Assigning..." : "Assign Members"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}