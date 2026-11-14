ALTER TABLE "users" ADD COLUMN "preferences" JSONB;

CREATE TABLE "upgrade_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "note" TEXT,
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "upgrade_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "upgrade_requests_user_id_idx" ON "upgrade_requests"("user_id");
ALTER TABLE "upgrade_requests" ADD CONSTRAINT "upgrade_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "support_inquiries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "support_inquiries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "support_inquiries_user_id_idx" ON "support_inquiries"("user_id");
ALTER TABLE "support_inquiries" ADD CONSTRAINT "support_inquiries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;