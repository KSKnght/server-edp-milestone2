/*
  Warnings:

  - Changed the type of `status` on the `assign_designation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `departments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `departmentStatus` on the `designation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "statusEmp" AS ENUM ('ACTIVE', 'RESIGNED', 'AWOL');

-- CreateEnum
CREATE TYPE "statusDep" AS ENUM ('ACTIVE', 'INACTIVE');

-- DropForeignKey
ALTER TABLE "designation" DROP CONSTRAINT "designation_departmentName_departmentStatus_fkey";

-- AlterTable
ALTER TABLE "assign_designation" DROP COLUMN "status",
ADD COLUMN     "status" "statusEmp" NOT NULL;

-- AlterTable
ALTER TABLE "departments" DROP COLUMN "status",
ADD COLUMN     "status" "statusDep" NOT NULL;

-- AlterTable
ALTER TABLE "designation" DROP COLUMN "departmentStatus",
ADD COLUMN     "departmentStatus" "statusDep" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "departments_dept_name_status_key" ON "departments"("dept_name", "status");

-- AddForeignKey
ALTER TABLE "designation" ADD CONSTRAINT "designation_departmentName_departmentStatus_fkey" FOREIGN KEY ("departmentName", "departmentStatus") REFERENCES "departments"("dept_name", "status") ON DELETE RESTRICT ON UPDATE CASCADE;
