-- CreateTable
CREATE TABLE `users` (
    `user_id` BIGINT NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `preferred_language` VARCHAR(5) NULL,
    `theme` VARCHAR(10) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Dorms` (
    `dorm_id` BIGINT NOT NULL AUTO_INCREMENT,
    `dorm_name` VARCHAR(255) NULL,
    `description` TEXT NULL,
    `address` TEXT NULL,
    `district` VARCHAR(100) NULL,
    `province` VARCHAR(100) NULL,
    `latitude` DECIMAL(10, 7) NULL,
    `longitude` DECIMAL(10, 7) NULL,
    `dorm_name_th` VARCHAR(255) NULL,
    `dorm_name_en` VARCHAR(255) NULL,
    `description_th` TEXT NULL,
    `description_en` TEXT NULL,
    `address_th` TEXT NULL,
    `address_en` TEXT NULL,
    `district_th` VARCHAR(100) NULL,
    `district_en` VARCHAR(100) NULL,
    `province_th` VARCHAR(100) NULL,
    `province_en` VARCHAR(100) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`dorm_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Dorm_Contacts` (
    `contact_id` BIGINT NOT NULL AUTO_INCREMENT,
    `dorm_id` BIGINT NOT NULL,
    `phone` VARCHAR(30) NULL,
    `line_id` VARCHAR(50) NULL,
    `email` VARCHAR(255) NULL,
    `facebook_url` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `Dorm_Contacts_dorm_id_idx`(`dorm_id`),
    PRIMARY KEY (`contact_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Dorm_Images` (
    `image_id` BIGINT NOT NULL AUTO_INCREMENT,
    `dorm_id` BIGINT NOT NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Dorm_Images_dorm_id_idx`(`dorm_id`),
    PRIMARY KEY (`image_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Amenities` (
    `amenities_id` BIGINT NOT NULL AUTO_INCREMENT,
    `amenity_name` VARCHAR(120) NULL,
    `amenity_name_th` VARCHAR(120) NULL,
    `amenity_name_en` VARCHAR(120) NULL,

    INDEX `Amenities_amenity_name_th_idx`(`amenity_name_th`),
    INDEX `Amenities_amenity_name_en_idx`(`amenity_name_en`),
    PRIMARY KEY (`amenities_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Dorms_Amenities` (
    `dorm_id` BIGINT NOT NULL,
    `amenities_id` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Dorms_Amenities_amenities_id_idx`(`amenities_id`),
    PRIMARY KEY (`dorm_id`, `amenities_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Room_types` (
    `room_type_id` BIGINT NOT NULL AUTO_INCREMENT,
    `dorm_id` BIGINT NOT NULL,
    `room_type_name` VARCHAR(120) NULL,
    `room_type_name_th` VARCHAR(120) NULL,
    `room_type_name_en` VARCHAR(120) NULL,
    `price_per_month` INTEGER NOT NULL DEFAULT 0,
    `available_rooms` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `Room_types_dorm_id_idx`(`dorm_id`),
    PRIMARY KEY (`room_type_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Dorms_Fees` (
    `dorm_id` BIGINT NOT NULL,
    `water_rate` DECIMAL(10, 2) NULL,
    `electric_rate` DECIMAL(10, 2) NULL,
    `advance_rent_months` TINYINT UNSIGNED NULL,
    `security_deposit_months` TINYINT UNSIGNED NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`dorm_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Dorm_Policies` (
    `dorm_id` BIGINT NOT NULL,
    `pet_allowed` BOOLEAN NULL,
    `smoking_allowed` BOOLEAN NULL,
    `gender_policy` VARCHAR(50) NULL,
    `policy_note_th` TEXT NULL,
    `policy_note_en` TEXT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`dorm_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reviews` (
    `review_id` BIGINT NOT NULL AUTO_INCREMENT,
    `dorm_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `rating` TINYINT UNSIGNED NOT NULL,
    `comment` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `Reviews_dorm_id_idx`(`dorm_id`),
    INDEX `Reviews_user_id_idx`(`user_id`),
    PRIMARY KEY (`review_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reviews_replies` (
    `reply_id` BIGINT NOT NULL AUTO_INCREMENT,
    `review_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `reply_text` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `Reviews_replies_review_id_idx`(`review_id`),
    INDEX `Reviews_replies_user_id_idx`(`user_id`),
    PRIMARY KEY (`reply_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reviews_Likes` (
    `like_id` BIGINT NOT NULL AUTO_INCREMENT,
    `review_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Reviews_Likes_user_id_idx`(`user_id`),
    UNIQUE INDEX `Reviews_Likes_review_id_user_id_key`(`review_id`, `user_id`),
    PRIMARY KEY (`like_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Favorites` (
    `favorite_id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `dorm_id` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Favorites_dorm_id_idx`(`dorm_id`),
    UNIQUE INDEX `Favorites_user_id_dorm_id_key`(`user_id`, `dorm_id`),
    PRIMARY KEY (`favorite_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Dorm_Contacts` ADD CONSTRAINT `Dorm_Contacts_dorm_id_fkey` FOREIGN KEY (`dorm_id`) REFERENCES `Dorms`(`dorm_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dorm_Images` ADD CONSTRAINT `Dorm_Images_dorm_id_fkey` FOREIGN KEY (`dorm_id`) REFERENCES `Dorms`(`dorm_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dorms_Amenities` ADD CONSTRAINT `Dorms_Amenities_dorm_id_fkey` FOREIGN KEY (`dorm_id`) REFERENCES `Dorms`(`dorm_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dorms_Amenities` ADD CONSTRAINT `Dorms_Amenities_amenities_id_fkey` FOREIGN KEY (`amenities_id`) REFERENCES `Amenities`(`amenities_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Room_types` ADD CONSTRAINT `Room_types_dorm_id_fkey` FOREIGN KEY (`dorm_id`) REFERENCES `Dorms`(`dorm_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dorms_Fees` ADD CONSTRAINT `Dorms_Fees_dorm_id_fkey` FOREIGN KEY (`dorm_id`) REFERENCES `Dorms`(`dorm_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dorm_Policies` ADD CONSTRAINT `Dorm_Policies_dorm_id_fkey` FOREIGN KEY (`dorm_id`) REFERENCES `Dorms`(`dorm_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reviews` ADD CONSTRAINT `Reviews_dorm_id_fkey` FOREIGN KEY (`dorm_id`) REFERENCES `Dorms`(`dorm_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reviews` ADD CONSTRAINT `Reviews_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reviews_replies` ADD CONSTRAINT `Reviews_replies_review_id_fkey` FOREIGN KEY (`review_id`) REFERENCES `Reviews`(`review_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reviews_replies` ADD CONSTRAINT `Reviews_replies_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reviews_Likes` ADD CONSTRAINT `Reviews_Likes_review_id_fkey` FOREIGN KEY (`review_id`) REFERENCES `Reviews`(`review_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reviews_Likes` ADD CONSTRAINT `Reviews_Likes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favorites` ADD CONSTRAINT `Favorites_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favorites` ADD CONSTRAINT `Favorites_dorm_id_fkey` FOREIGN KEY (`dorm_id`) REFERENCES `Dorms`(`dorm_id`) ON DELETE CASCADE ON UPDATE CASCADE;
