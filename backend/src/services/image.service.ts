import prisma from '../prisma';
import { s3 } from '../config/s3';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env';
import { AppError } from './AppError';

interface CreateImageDto {
  title: string;
  key: string;
  url: string;
  userId: string;
  albumId?: string;
}

export async function createImage(data: CreateImageDto) {
  const image = await prisma.image.create({
    data,
  });
  return image;
}

export async function findImagesByUserId(userId: string, page: number = 1, limit: number = 10, search: string = '') {
  const skip = (page - 1) * limit;
  const where = {
    userId,
    title: {
      contains: search,
      mode: 'insensitive' as const,
    },
  };
  const totalImages = await prisma.image.count({ where });
  const images = await prisma.image.findMany({
    where,
    orderBy: {
      createdAt: 'desc',
    },
    skip,
    take: limit,
  });
  return { images, totalImages };
}

export async function findImageById(id: string) {
  const image = await prisma.image.findUnique({
    where: { id },
  });

  if (!image) {
    throw new AppError('Image not found', 404);
  }

  return image;
}

export async function deleteImage(id: string, userId: string) {
  const image = await prisma.image.findFirst({
    where: { 
      id,
      userId 
    },
  });

  if (!image) {
    throw new AppError('Image not found or you are not authorized to delete this image', 404);
  }

  const deleteParams = {
    Bucket: env.S3_BUCKET_NAME,
    Key: image.key,
  };

  try {
    await s3.send(new DeleteObjectCommand(deleteParams));
  } catch (error) {
    console.error("Error deleting from S3, but proceeding to delete from DB:", error)
  }

  await prisma.image.delete({ where: { id } });

  return image;
}

export async function updateImage(id: string, userId: string, data: { title: string }) {
  const image = await prisma.image.findFirst({
    where: { 
      id,
      userId 
    },
  });

  if (!image) {
    throw new AppError('Image not found or you are not authorized to update this image', 404);
  }

  const updatedImage = await prisma.image.update({
    where: { id },
    data,
  });

  return updatedImage;
}