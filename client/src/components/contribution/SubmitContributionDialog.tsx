import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";

import {
  createContributionSchema,
  type CreateContributionForm,
} from "../../lib/validations/contribution.schema";
import { createContribution } from "../../services/contribution.service";

type SubmitContributionDialogProps = {
  taskId: number;
  assignees: { id: number; name: string }[];
  currentUserId: number;
  onContributionSubmitted: () => void;
};

function SubmitContributionDialog({
  taskId,
  assignees,
  currentUserId,
  onContributionSubmitted,
}: SubmitContributionDialogProps) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<CreateContributionForm>({
    resolver: zodResolver(createContributionSchema),
    defaultValues: {
      title: "",
      description: "",
      proofUrl: "",
      contributors: [currentUserId],
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: "",
        description: "",
        proofUrl: "",
        contributors: [currentUserId],
      });
    }
  }, [open, currentUserId, reset]);

  const contributors = watch("contributors") || [];

  const toggleContributor = (id: number) => {
    if (id === currentUserId) return; // Cannot toggle off self
    if (contributors.includes(id)) {
      setValue(
        "contributors",
        contributors.filter((cId) => cId !== id)
      );
    } else {
      setValue("contributors", [...contributors, id]);
    }
  };

  const onSubmit = async (data: CreateContributionForm) => {
    try {
      await createContribution({
        ...data,
        taskId,
      });
      toast.success("Contribution submitted successfully!");
      setOpen(false);
      onContributionSubmitted();
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit contribution");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Submit Contribution</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Submit Contribution</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="title">Contribution Title</Label>
            <Input
              id="title"
              placeholder="e.g., Added login validation schema"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-red-500">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide a detailed summary of your changes, challenges, and implementation..."
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="proofUrl">GitHub Link (Optional)</Label>
            <Input
              id="proofUrl"
              placeholder="https://github.com/username/repo/pull/1"
              {...register("proofUrl")}
            />
            {errors.proofUrl && (
              <p className="text-sm text-red-500">
                {errors.proofUrl.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Co-Contributors (Group Contribution)</Label>
            <div className="border border-border rounded-lg p-3 max-h-[140px] overflow-y-auto space-y-2 bg-muted/20">
              {assignees.map((assignee) => {
                const isSelf = assignee.id === currentUserId;
                const isChecked = contributors.includes(assignee.id);
                return (
                  <div key={assignee.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`contributor-${assignee.id}`}
                      checked={isChecked}
                      disabled={isSelf}
                      onCheckedChange={() => toggleContributor(assignee.id)}
                    />
                    <Label
                      htmlFor={`contributor-${assignee.id}`}
                      className="text-sm font-normal cursor-pointer select-none flex-1"
                    >
                      {assignee.name} {isSelf && <span className="text-muted-foreground text-xs">(You)</span>}
                    </Label>
                  </div>
                );
              })}
            </div>
            {errors.contributors && (
              <p className="text-sm text-red-500">
                {errors.contributors.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachment">Attachment (Optional)</Label>
            <Input
              id="attachment"
              type="file"
              className="cursor-pointer file:text-foreground file:font-semibold"
            />
            <p className="text-[11px] text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border">
              ℹ️ Local file uploads are not supported by the database schema on the server. Please provide external links (e.g., GitHub PRs, Google Drive, hosted static URLs) via the GitHub Link field.
            </p>
          </div>

          <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default SubmitContributionDialog;
