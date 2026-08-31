import { NextRequest } from 'next/server';
import { verifyPublisherAuth, successResponse, errorResponse, createPublisherRepository } from '@/lib/auth';
import { saveFile, generateFilename, parseFormData } from '@/lib/utils';

// PATCH /api/publisher/profile — Update publisher profile info and avatar
export async function PATCH(req: NextRequest) {
  const publisher = await verifyPublisherAuth(req);
  if (!publisher) return errorResponse('Unauthorized', 401);

  try {
    const { fields, files } = await parseFormData(req);
    const { name, phone, bio, website } = fields;
    
    let avatarPath: string | undefined;
    if (files.avatar) {
      const filename = generateFilename(files.avatar.originalName);
      avatarPath = await saveFile(files.avatar.buffer, filename, 'avatars');
    }

    let bannerPath: string | undefined;
    if (files.banner) {
      const filename = generateFilename(files.banner.originalName);
      bannerPath = await saveFile(files.banner.buffer, filename, 'banners');
    }

    const repo = createPublisherRepository();
    const updateData: any = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;
    if (website !== undefined) updateData.website = website;
    if (avatarPath) updateData.avatar = avatarPath;
    if (bannerPath) updateData.banner = bannerPath;

    const updated = await repo.update(publisher.id, updateData);
    return successResponse(updated.getProfile());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    return errorResponse(message);
  }
}
