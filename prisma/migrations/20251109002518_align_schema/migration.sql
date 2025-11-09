/*
  Warnings:

  - You are about to drop the column `accessToken` on the `TokenCache` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `TokenCache` table. All the data in the column will be lost.
  - You are about to drop the column `lastRefreshed` on the `TokenCache` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `TokenCache` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `User` table. All the data in the column will be lost.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password_hash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TokenCache" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "expires_at" INTEGER,
    "last_refreshed" INTEGER
);
INSERT INTO "new_TokenCache" ("id") SELECT "id" FROM "TokenCache";
DROP TABLE "TokenCache";
ALTER TABLE "new_TokenCache" RENAME TO "TokenCache";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("id", "role", "username") SELECT "id", "role", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
