export type Task = {
  id: number;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  deadline: string | null;
  createdAt: string;

  createdBy: {
    id: number;
    name: string;
  };

  assignees: {
    id: number;
    name: string;
    assignedAt: string;
    roleInTask: string;
  }[];
};