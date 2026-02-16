/*
  Warnings:

  - You are about to drop the column `picture_url` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `users` DROP COLUMN `picture_url`,
    ADD COLUMN `fullname` VARCHAR(120) NULL,
    ADD COLUMN `phone` VARCHAR(30) NULL,
    ADD COLUMN `picture` LONGTEXT NULL;
