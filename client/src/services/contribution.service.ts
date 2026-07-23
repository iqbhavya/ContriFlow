import api from "./api";
import type { CreateContributionForm } from "../lib/validations/contribution.schema";

export const createContribution = async (data: CreateContributionForm & { taskId: number }) => {
  const response = await api.post("/contributions", data);
  return response.data;
};

export const getTaskContributions = async (taskId: number) => {
  const response = await api.get(`/contributions/task/${taskId}`);
  return response.data;
};

export const reviewContribution = async (
  contributionId: number,
  data: { status: "APPROVED" | "REJECTED"; feedback?: string }
) => {
  const response = await api.patch(`/contributions/${contributionId}/review`, data);
  return response.data;
};
