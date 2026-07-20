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
  createTaskSchema,
  type CreateTaskForm,
} from "../../lib/validations/task.schema";

import {createTask} from "../../services/task.service";


type CreateTaskDialogProps = {
  projectId: number;  
  onTaskCreated: () => void;
};

function CreateTaskDialog({ projectId, onTaskCreated }: CreateTaskDialogProps){
    const form = useForm<CreateTaskForm>({
        resolver: zodResolver(createTaskSchema),
      });

    const [open, setOpen] = useState(false);
    const onSubmit = async (data: CreateTaskForm) => {

      console.log(data);
        try {
          await createTask({
            ...data,
            projectId,
          });
    
          form.reset();
          setOpen(false);
    
          onTaskCreated();
        } catch (error) {
          console.error(error);
        }
      };
      
    return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Task</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>
        <form
  className="space-y-4"
  onSubmit={form.handleSubmit(
    onSubmit,
    (errors) => {
      console.log("Validation errors:", errors);
    }
  )}
>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>

              <Input
                id="title"
                placeholder="Enter task title"
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>

              <Textarea
                id="description"
                placeholder="Enter task description"
                {...form.register("description")}
              />

              {form.formState.errors.description && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full">
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateTaskDialog;
