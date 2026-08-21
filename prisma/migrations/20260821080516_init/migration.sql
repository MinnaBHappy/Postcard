-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserName" AS ENUM ('MIN', 'MOMOKA');

-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('ko', 'ja');

-- CreateEnum
CREATE TYPE "PostcardStatus" AS ENUM ('WRITING', 'IN_TRANSIT', 'DELIVERED', 'READ');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" "UserName" NOT NULL,
    "pin" TEXT NOT NULL,
    "default_location_lat" DOUBLE PRECISION NOT NULL,
    "default_location_lng" DOUBLE PRECISION NOT NULL,
    "preferred_locale" "Locale" NOT NULL DEFAULT 'ko',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "postcards" (
    "id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "image_url" TEXT,
    "message_ko" TEXT,
    "message_ja" TEXT,
    "design_template_id" TEXT,
    "status" "PostcardStatus" NOT NULL DEFAULT 'WRITING',
    "sender_lat" DOUBLE PRECISION,
    "sender_lng" DOUBLE PRECISION,
    "receiver_lat" DOUBLE PRECISION,
    "receiver_lng" DOUBLE PRECISION,
    "pigeon_id" TEXT,
    "weather_modifier" DOUBLE PRECISION,
    "departed_at" TIMESTAMP(3),
    "arrival_eta" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "read_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "postcards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pigeons" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "base_speed" DOUBLE PRECISION NOT NULL,
    "avatar_url" TEXT,

    CONSTRAINT "pigeons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "thumbnail_url" TEXT NOT NULL,
    "tags" TEXT[],

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_name_key" ON "users"("name");

-- AddForeignKey
ALTER TABLE "postcards" ADD CONSTRAINT "postcards_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postcards" ADD CONSTRAINT "postcards_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postcards" ADD CONSTRAINT "postcards_pigeon_id_fkey" FOREIGN KEY ("pigeon_id") REFERENCES "pigeons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postcards" ADD CONSTRAINT "postcards_design_template_id_fkey" FOREIGN KEY ("design_template_id") REFERENCES "templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
