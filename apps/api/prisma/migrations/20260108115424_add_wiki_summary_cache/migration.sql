-- AlterTable
ALTER TABLE "CarModel" ADD COLUMN "wikiGenerationHintEn" TEXT;
ALTER TABLE "CarModel" ADD COLUMN "wikiGenerationHintFr" TEXT;
ALTER TABLE "CarModel" ADD COLUMN "wikiTitleEn" TEXT;
ALTER TABLE "CarModel" ADD COLUMN "wikiTitleFr" TEXT;

-- CreateTable
CREATE TABLE "WikiSummaryCache" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "lang" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "extract" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "fetchedAt" DATETIME NOT NULL,
    "expiresAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "WikiSummaryCache_expiresAt_idx" ON "WikiSummaryCache"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "WikiSummaryCache_lang_title_key" ON "WikiSummaryCache"("lang", "title");
