/*
  Warnings:

  - You are about to drop the column `userId` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userEmail` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_userId_fkey";

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "userId",
ADD COLUMN     "userEmail" TEXT NOT NULL,
ALTER COLUMN "title" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "role" TEXT NOT NULL;

-- DropTable
DROP TABLE "User";
