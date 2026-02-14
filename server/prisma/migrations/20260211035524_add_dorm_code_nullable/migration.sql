/*
  Warnings:

  - A unique constraint covering the columns `[dorm_code]` on the table `Dorms` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `dorms` ADD COLUMN `dorm_code` VARCHAR(30) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Dorms_dorm_code_key` ON `Dorms`(`dorm_code`);
