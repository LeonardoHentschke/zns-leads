-- AlterTable
ALTER TABLE "request_logs" ADD COLUMN     "error_details" JSONB,
ADD COLUMN     "error_message" TEXT,
ADD COLUMN     "status_code" INTEGER;
