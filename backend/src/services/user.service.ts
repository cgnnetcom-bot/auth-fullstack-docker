import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserService {
  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw { status: 404, message: 'User not found' };
    }

    return user;
  }
}
