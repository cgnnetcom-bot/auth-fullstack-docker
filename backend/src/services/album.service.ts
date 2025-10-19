import prisma from '../prisma';
import { AppError } from './AppError';

interface CreateAlbumDto {
  name: string;
  userId: string;
}

export async function createAlbum(data: CreateAlbumDto) {
  const existingAlbum = await prisma.album.findFirst({
    where: {
      name: data.name,
      userId: data.userId,
    },
  });

  if (existingAlbum) {
    throw new AppError('An album with this name already exists', 409);
  }

  const album = await prisma.album.create({
    data,
  });
  return album;
}

export async function findAlbumsByUserId(userId: string) {
  const albums = await prisma.album.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      _count: {
        select: { images: true },
      },
    },
  });
  return albums;
}

export async function findAlbumById(id: string, userId: string) {
  const album = await prisma.album.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      images: {
        include: {
          image: true,
        },
        orderBy: {
          image: {
            createdAt: 'desc',
          },
        },
      },
    },
  });

  if (!album) {
    throw new AppError('Album not found or you are not authorized to view it', 404);
  }

  return {
    ...album,
    images: album.images.map((i) => i.image),
  };
}

export async function addImageToAlbum(albumId: string, imageId: string, userId: string) {
  const album = await prisma.album.findFirst({
    where: {
      id: albumId,
      userId,
    },
  });

  if (!album) {
    throw new AppError('Album not found or you are not authorized to access it', 404);
  }

  const image = await prisma.image.findFirst({
    where: {
      id: imageId,
      userId,
    },
  });

  if (!image) {
    throw new AppError('Image not found or you are not authorized to access it', 404);
  }

  await prisma.imagesOnAlbums.create({
    data: {
      albumId,
      imageId,
    },
  });
}

export async function removeImageFromAlbum(albumId: string, imageId: string, userId: string) {
  const album = await prisma.album.findFirst({
    where: {
      id: albumId,
      userId,
    },
  });

  if (!album) {
    throw new AppError('Album not found or you are not authorized to access it', 404);
  }

  const image = await prisma.image.findFirst({
    where: {
      id: imageId,
      userId,
    },
  });

  if (!image) {
    throw new AppError('Image not found or you are not authorized to access it', 404);
  }

  await prisma.imagesOnAlbums.delete({
    where: {
      albumId_imageId: {
        albumId,
        imageId,
      },
    },
  });
}

export async function deleteAlbum(id: string, userId: string) {
  const album = await prisma.album.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!album) {
    throw new AppError('Album not found or you are not authorized to delete it', 404);
  }

  await prisma.album.delete({ where: { id } });
}

export async function updateAlbum(id: string, userId: string, data: { name: string }) {
  const album = await prisma.album.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!album) {
    throw new AppError('Album not found or you are not authorized to update it', 404);
  }

  const updatedAlbum = await prisma.album.update({
    where: { id },
    data,
  });

  return updatedAlbum;
}
