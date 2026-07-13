export type Project = {
  id: number;
  name: string;
  description: string | null;
  role: "LEAD" | "MEMBER";
};

export type ProjectDetails = {
  id: number;
  name: string;
  description: string | null;
  role: "LEAD" | "MEMBER";
  inviteCode?: string;
  members: {
    id: number;
    name: string;
    email: string;
    role: "LEAD" | "MEMBER";
  }[];
};

