-- CreateTable
CREATE TABLE "BoardPresence" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "tabId" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "imageUrl" TEXT,
    "lastSeen" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BoardPresence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BoardPresence_boardId_userId_sessionId_tabId_key" ON "BoardPresence"("boardId", "userId", "sessionId", "tabId");

-- CreateIndex
CREATE INDEX "BoardPresence_boardId_lastSeen_idx" ON "BoardPresence"("boardId", "lastSeen");

-- AddForeignKey
ALTER TABLE "BoardPresence" ADD CONSTRAINT "BoardPresence_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;
