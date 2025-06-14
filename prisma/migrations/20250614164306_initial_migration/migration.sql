-- CreateTable
CREATE TABLE "athletes_rights" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "is_registered_clt" BOOLEAN,
    "had_injury_during_career" BOOLEAN,
    "injury_description" TEXT,
    "injury_timing" TEXT,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "utm_content" TEXT,
    "utm_term" TEXT,
    "clicked_whatsapp_button" BOOLEAN,
    "webhook_sent" BOOLEAN,
    "ip" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "athletes_rights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retired" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "score" TEXT,
    "gender" TEXT,
    "birth_date" TIMESTAMP(3),
    "contribution_time" TEXT,
    "is_unhealthy" BOOLEAN,
    "is_military" BOOLEAN,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "utm_content" TEXT,
    "utm_term" TEXT,
    "ip" TEXT,
    "device" TEXT,
    "date_benefit_was_granted" TIMESTAMP(3),
    "webhook_sent" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retired_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_logs" (
    "id" SERIAL NOT NULL,
    "method" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "headers" JSONB,
    "body" JSONB,
    "query_params" JSONB,
    "ip" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "request_logs_pkey" PRIMARY KEY ("id")
);
