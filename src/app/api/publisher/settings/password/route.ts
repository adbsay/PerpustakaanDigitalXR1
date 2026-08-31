import { NextRequest } from 'next/server';
import { verifyPublisherAuth, successResponse, errorResponse, createPublisherRepository } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// PATCH /api/publisher/settings/password — Update publisher password
export async function PATCH(req: NextRequest) {
  const publisher = await verifyPublisherAuth(req);
  if (!publisher) return errorResponse('Unauthorized', 401);

  try {
    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return errorResponse('Kata sandi lama dan baru wajib diisi', 400);
    }

    if (newPassword.length < 8) {
      return errorResponse('Kata sandi baru minimal 8 karakter', 400);
    }

    // Verify current password
    const repo = createPublisherRepository();
    const user = await repo.findById(publisher.id);
    if (!user) return errorResponse('User not found', 404);

    const isMatch = await user.verifyPassword(currentPassword);
    if (!isMatch) {
      return errorResponse('Kata sandi saat ini tidak cocok', 400);
    }

    // Update password
    await repo.update(publisher.id, { password: newPassword });

    return successResponse({ message: 'Kata sandi berhasil diperbarui' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal memperbarui kata sandi';
    return errorResponse(message);
  }
}
