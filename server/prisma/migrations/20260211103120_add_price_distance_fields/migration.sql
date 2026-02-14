-- AlterTable
ALTER TABLE `dorms` ADD COLUMN `subzone_th` VARCHAR(100) NULL,
    ADD COLUMN `zone_th` VARCHAR(100) NULL,
    ALTER COLUMN `review_count` DROP DEFAULT,
    MODIFY `verified_status` BOOLEAN NULL DEFAULT false;
