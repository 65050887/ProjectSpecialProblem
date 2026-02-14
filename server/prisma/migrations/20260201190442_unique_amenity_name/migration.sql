/*
  Warnings:

  - A unique constraint covering the columns `[amenity_name_th]` on the table `Amenities` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[amenity_name_en]` on the table `Amenities` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Amenities_amenity_name_th_key` ON `Amenities`(`amenity_name_th`);

-- CreateIndex
CREATE UNIQUE INDEX `Amenities_amenity_name_en_key` ON `Amenities`(`amenity_name_en`);
