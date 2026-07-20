import z from "zod";

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Task name must be at least 3 characters.")
    .max(100, "Task name cannot exceed 50 characters."),

  description: z
    .string()
    .trim()
    .max(300, "Description cannot exceed 300 characters."),

  deadline: z
    .string()
    .optional()
    .or(z.literal("")),
});

export type CreateTaskForm = z.infer<typeof createTaskSchema>;