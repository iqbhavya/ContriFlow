export type Contribution = {
  id: number;
  title: string;
  description: string | null;
  proofUrl: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  feedback: string | null;
  submittedBy: {
    id: number;
    name: string;
  };
  reviewedBy: {
    id: number;
    name: string;
  } | null;
  contributors: {
    id: number;
    name: string;
    addedAt: string;
  }[];
};
