/*
  Warnings:

  - You are about to drop the column `duration_ms` on the `request_logs` table. All the data in the column will be lost.
  - You are about to drop the column `response` on the `request_logs` table. All the data in the column will be lost.
  - You are about to drop the column `status_code` on the `request_logs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "request_logs" DROP COLUMN "duration_ms",
DROP COLUMN "response",
DROP COLUMN "status_code";
