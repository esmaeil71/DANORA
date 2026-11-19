-- CreateEnum
CREATE TYPE "ConversationKind" AS ENUM ('chat', 'shop');

-- AlterTable
ALTER TABLE "conversations" ADD COLUMN "kind" "ConversationKind" NOT NULL DEFAULT 'chat';

-- AlterTable
ALTER TABLE "messages" ADD COLUMN "metadata" JSONB;

-- CreateIndex
CREATE INDEX "conversations_user_id_kind_idx" ON "conversations"("user_id", "kind");