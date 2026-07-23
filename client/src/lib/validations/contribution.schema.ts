import z from "zod";

export const createContributionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters.")
    .max(100, "Title cannot exceed 100 characters."),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(500, "Description cannot exceed 500 characters."),
  proofUrl: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || val.startsWith("http://") || val.startsWith("https://"), {
      message: "GitHub Link must be a valid URL starting with http:// or https://",
    })
    .or(z.literal("")),
  contributors: z
    .array(z.number())
    .min(1, "At least one contributor is required"),
});

export type CreateContributionForm = z.infer<typeof createContributionSchema>;
