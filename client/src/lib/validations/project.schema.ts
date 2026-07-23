import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Project name must be at least 3 characters.")
    .max(50, "Project name cannot exceed 50 characters."),

  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters.")
    .max(100, "Description cannot exceed 100 characters."),
});

export const joinProjectSchema = z.object({
  inviteCode: z
    .string()
    .trim()
    .min(1, "Invite code is required.")
    .max(20, "Invite code cannot exceed 20 characters."),
});

export type CreateProjectForm = z.infer<typeof createProjectSchema>;
export type JoinProjectForm = z.infer<typeof joinProjectSchema>;