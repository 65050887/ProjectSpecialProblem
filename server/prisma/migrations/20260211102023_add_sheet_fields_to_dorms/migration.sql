-- AlterTable
ALTER TABLE `dorms` ADD COLUMN `available_rooms` INTEGER NULL,
    ADD COLUMN `avg_rating` DECIMAL(3, 2) NULL,
    ADD COLUMN `distance_m` INTEGER NULL,
    ADD COLUMN `price_max` INTEGER NULL,
    ADD COLUMN `price_min` INTEGER NULL,
    ADD COLUMN `review_count` INTEGER NULL DEFAULT 0,
    ADD COLUMN `total_rooms` INTEGER NULL,
    ADD COLUMN `verified_status` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `Dorms_price_min_idx` ON `Dorms`(`price_min`);

-- CreateIndex
CREATE INDEX `Dorms_price_max_idx` ON `Dorms`(`price_max`);

-- CreateIndex
CREATE INDEX `Dorms_distance_m_idx` ON `Dorms`(`distance_m`);

-- CreateIndex
CREATE INDEX `Dorms_verified_status_idx` ON `Dorms`(`verified_status`);
