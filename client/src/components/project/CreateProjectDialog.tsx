import { Button } from "../ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createProjectSchema,
  type CreateProjectForm,
} from "../../lib/validations/project.schema";

import { createProject } from "../../services/project.service";
import { toast } from "sonner";



type CreateProjectDialogProps = {
  onProjectCreated: () => void;
};

function CreateProjectDialog({ onProjectCreated }: CreateProjectDialogProps) {
  const form = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema),
  });
  const [open, setOpen] = useState(false);

  const onSubmit = async (data: CreateProjectForm) => {
    try {
      await createProject(data);
      toast.success("Project created successfully!");

      form.reset();
      setOpen(false);

      onProjectCreated();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create project");
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Project</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>

              <Input
                id="name"
                placeholder="Enter project name"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>

              <Textarea
                id="description"
                placeholder="Enter project description"
                {...form.register("description")}
              />

              {form.formState.errors.description && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full">
              Create Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateProjectDialog;
