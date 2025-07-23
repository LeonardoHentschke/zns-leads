/*
  Warnings:

  - You are about to drop the column `pages_visited` on the `athletes_rights` table. All the data in the column will be lost.
  - You are about to drop the column `pages_visited` on the `retired` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "athletes_rights" DROP COLUMN "pages_visited",
ADD COLUMN     "injury_club" TEXT,
ADD COLUMN     "injury_date" TEXT,
ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "retired" DROP COLUMN "pages_visited",
ADD COLUMN     "metadata" JSONB;
