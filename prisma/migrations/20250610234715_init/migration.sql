-- CreateTable
CREATE TABLE "AthletesRights" (
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
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AthletesRights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Retired" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "percentage" TEXT,
    "gender" TEXT,
    "birth_date" TEXT,
    "contribution_time" TEXT,
    "is_unhealthy" BOOLEAN,
    "is_military" BOOLEAN,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "utm_content" TEXT,
    "utm_term" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Retired_pkey" PRIMARY KEY ("id")
);
