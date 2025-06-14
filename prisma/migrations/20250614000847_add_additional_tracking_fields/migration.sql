/*
  Warnings:

  - You are about to drop the column `percentage` on the `Retired` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AthletesRights" ADD COLUMN     "clicked_whatsapp_button" BOOLEAN,
ADD COLUMN     "ip" TEXT,
ADD COLUMN     "webhook_sent" BOOLEAN;

-- AlterTable
ALTER TABLE "Retired" DROP COLUMN "percentage",
ADD COLUMN     "date_benefit_was_granted" TIMESTAMP(3),
ADD COLUMN     "device" TEXT,
ADD COLUMN     "ip" TEXT,
ADD COLUMN     "score" TEXT;
