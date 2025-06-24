/*
  Warnings:

  - You are about to drop the column `body` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Note` table. All the data in the column will be lost.
  - Added the required column `content` to the `Note` table without a default value. This is not possible if the table is not empty.
  - Added the required column `notebookId` to the `Note` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Note` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Note` DROP FOREIGN KEY `Note_userId_fkey`;

-- DropIndex
DROP INDEX `Note_userId_fkey` ON `Note`;

-- AlterTable
ALTER TABLE `Note` DROP COLUMN `body`,
    DROP COLUMN `userId`,
    ADD COLUMN `content` TEXT NOT NULL,
    ADD COLUMN `notebookId` INTEGER NOT NULL,
    ADD COLUMN `type` ENUM('text', 'summary', 'outline', 'qa') NOT NULL DEFAULT 'text',
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- CreateTable
CREATE TABLE `Notebook` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Source` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `url` VARCHAR(191) NULL,
    `type` ENUM('document', 'webpage', 'pdf', 'text') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notebookId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_NoteToSource` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_NoteToSource_AB_unique`(`A`, `B`),
    INDEX `_NoteToSource_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Notebook` ADD CONSTRAINT `Notebook_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Note` ADD CONSTRAINT `Note_notebookId_fkey` FOREIGN KEY (`notebookId`) REFERENCES `Notebook`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Source` ADD CONSTRAINT `Source_notebookId_fkey` FOREIGN KEY (`notebookId`) REFERENCES `Notebook`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_NoteToSource` ADD CONSTRAINT `_NoteToSource_A_fkey` FOREIGN KEY (`A`) REFERENCES `Note`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_NoteToSource` ADD CONSTRAINT `_NoteToSource_B_fkey` FOREIGN KEY (`B`) REFERENCES `Source`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
