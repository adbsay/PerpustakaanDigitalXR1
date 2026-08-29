import path from 'path';
import fs from 'fs';

// ============================================================
// UTILITIES — General purpose helpers
// ============================================================

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Generate unique filename
export function generateFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}${ext}`;
}

// Save file to public/uploads directory
export async function saveFile(
  buffer: Buffer,
  filename: string,
  subdirectory: 'covers' | 'pdfs',
): Promise<string> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', subdirectory);

  // Ensure directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, filename);
  fs.writeFileSync(filePath, buffer);

  return `/uploads/${subdirectory}/${filename}`;
}

// Delete file from uploads
export function deleteFile(filePath: string): void {
  if (!filePath) return;
  const absolutePath = path.join(process.cwd(), 'public', filePath);
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
}

// Truncate text for preview
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Format date to Indonesian locale
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Parse multipart form data for file uploads
export async function parseFormData(request: Request): Promise<{
  fields: Record<string, string>;
  files: Record<string, { buffer: Buffer; originalName: string; mimeType: string }>;
}> {
  const formData = await request.formData();
  const fields: Record<string, string> = {};
  const files: Record<string, { buffer: Buffer; originalName: string; mimeType: string }> = {};

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      const buffer = Buffer.from(await value.arrayBuffer());
      files[key] = {
        buffer,
        originalName: value.name,
        mimeType: value.type,
      };
    } else {
      fields[key] = value as string;
    }
  }

  return { fields, files };
}
