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

type CreateProjectForm = {
  name: string;
  description: string;
};

function CreateProjectDialog() {
  const form = useForm<CreateProjectForm>();

  const onSubmit = (data: CreateProjectForm) => {
    console.log(data);
  };

  return (
    <Dialog>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>

              <Textarea
                id="description"
                placeholder="Enter project description"
                {...form.register("description")}
              />
            </div>

            <Button type="submit" className="w-full">Create Project</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateProjectDialog;
