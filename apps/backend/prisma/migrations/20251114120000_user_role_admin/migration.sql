-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'admin');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'user';
ALTER TABLE "users" ADD COLUMN "suspended" BOOLEAN NOT NULL DEFAULT false;