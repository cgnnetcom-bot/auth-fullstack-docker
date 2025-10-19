/*
  Warnings:

  - You are about to drop the column `albumId` on the `Image` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_albumId_fkey";

-- AlterTable
ALTER TABLE "Image" DROP COLUMN "albumId";

-- CreateTable
CREATE TABLE "ImagesOnAlbums" (
    "albumId" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,

    CONSTRAINT "ImagesOnAlbums_pkey" PRIMARY KEY ("albumId","imageId")
);

-- AddForeignKey
ALTER TABLE "ImagesOnAlbums" ADD CONSTRAINT "ImagesOnAlbums_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImagesOnAlbums" ADD CONSTRAINT "ImagesOnAlbums_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
