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

  createdAt: string;

  createdBy: {
    id: number;
    name: string;
  };

  members: {
    id: number;
    name: string;
    role: "LEAD" | "MEMBER";
    joinedAt: string;
  }[];

  stats: {
    members: number;
    tasks: number;
    contributions: number;
  };

  inviteCode?: string;
};
