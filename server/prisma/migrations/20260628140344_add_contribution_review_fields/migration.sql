/*
  Warnings:

  - You are about to drop the column `projectId` on the `Contribution` table. All the data in the column will be lost.
  - You are about to drop the column `proofLink` on the `Contribution` table. All the data in the column will be lost.
  - Made the column `taskId` on table `Contribution` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Contribution" DROP CONSTRAINT "Contribution_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Contribution" DROP CONSTRAINT "Contribution_taskId_fkey";

-- AlterTable
ALTER TABLE "Contribution" DROP COLUMN "projectId",
DROP COLUMN "proofLink",
ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "proofUrl" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedById" INTEGER,
ALTER COLUMN "taskId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
