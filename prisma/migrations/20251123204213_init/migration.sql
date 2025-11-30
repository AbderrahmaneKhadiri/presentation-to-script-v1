-- CreateTable
CREATE TABLE "Presentation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Slide" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slideNumber" INTEGER NOT NULL,
    "extractedText" TEXT,
    "imageUrl" TEXT,
    "scriptSimple" TEXT,
    "scriptMedium" TEXT,
    "scriptPro" TEXT,
    "presentationId" TEXT NOT NULL,
    CONSTRAINT "Slide_presentationId_fkey" FOREIGN KEY ("presentationId") REFERENCES "Presentation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Slide_presentationId_slideNumber_key" ON "Slide"("presentationId", "slideNumber");
