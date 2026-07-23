import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

import {
  joinProjectSchema,
  type JoinProjectForm,
} from "../../lib/validations/project.schema";
import { joinProject } from "../../services/project.service";

type JoinProjectDialogProps = {
  onProjectJoined: () => void;
  trigger?: React.ReactNode;
};

function JoinProjectDialog({ onProjectJoined, trigger }: JoinProjectDialogProps) {
  const form = useForm<JoinProjectForm>({
    resolver: zodResolver(joinProjectSchema),
    defaultValues: {
      inviteCode: "",
    },
  });
  const [open, setOpen] = useState(false);

  const onSubmit = async (data: JoinProjectForm) => {
    try {
      await joinProject(data.inviteCode);
      toast.success("Joined project successfully!");
      form.reset();
      setOpen(false);
      onProjectJoined();
    } catch (error) {
      console.error(error);
      toast.error("Failed to join project. Please verify the invite code.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Join Project</Button>}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join Project</DialogTitle>
          <DialogDescription>
            Enter the unique invite code provided by the project lead to join their project team.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4 pt-2" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="inviteCode">Invite Code</Label>
            <Input
              id="inviteCode"
              placeholder="e.g., ABC123XYZ"
              {...form.register("inviteCode")}
            />
            {form.formState.errors.inviteCode && (
              <p className="text-sm text-red-500">
                {form.formState.errors.inviteCode.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Joining..." : "Join Project"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default JoinProjectDialog;
