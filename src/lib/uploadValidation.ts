import path from 'path';

type UploadRule = {
  mimes: string[];
  exts: string[];
  maxSize: number;
};

const RULES: Record<string, UploadRule> = {
  pdfs: {
    mimes: ['application/pdf'],
    exts: ['.pdf'],
    maxSize: 50 * 1024 * 1024, // 50MB
  },
  covers: {
    mimes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
    exts: ['.jpg', '.jpeg', '.png', '.webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  avatars: {
    mimes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
    exts: ['.jpg', '.jpeg', '.png', '.webp'],
    maxSize: 2 * 1024 * 1024, // 2MB
  },
  banners: {
    mimes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
    exts: ['.jpg', '.jpeg', '.png', '.webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  categories: {
    mimes: ['image/svg+xml'],
    exts: ['.svg'],
    maxSize: 1 * 1024 * 1024, // 1MB
  },
};

export interface FilePayload {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}

export function assertValidUpload(
  file: FilePayload,
  subdirectory: 'pdfs' | 'covers' | 'avatars' | 'banners' | 'categories' | string,
): void {
  const rule = RULES[subdirectory];
  if (!rule) {
    throw new Error(`Tujuan upload tidak dikenal: ${subdirectory}`);
  }

  const ext = path.extname(file.originalName).toLowerCase();
  if (!rule.exts.includes(ext)) {
    throw new Error(`Ekstensi "${ext}" tidak diizinkan untuk ${subdirectory} (hanya: ${rule.exts.join(', ')})`);
  }

  // MIME check (allow case-insensitive or octet-stream fallback if extension is solid, but enforce strict image/pdf types)
  const normalizedMime = (file.mimeType || '').toLowerCase();
  if (normalizedMime && !rule.mimes.includes(normalizedMime)) {
    // If client sent application/octet-stream, we require matching extension and safe byte checks
    if (normalizedMime !== 'application/octet-stream') {
      throw new Error(`Tipe file "${file.mimeType}" tidak diizinkan untuk ${subdirectory} (hanya: ${rule.mimes.join(', ')})`);
    }
  }

  if (file.buffer.byteLength > rule.maxSize) {
    const maxMb = rule.maxSize / (1024 * 1024);
    throw new Error(`Ukuran file (${(file.buffer.byteLength / (1024 * 1024)).toFixed(2)}MB) melebihi batas maksimal ${maxMb}MB`);
  }

  // Basic magic bytes validation
  if (subdirectory === 'pdfs') {
    // PDF magic bytes %PDF (0x25, 0x50, 0x44, 0x46)
    if (file.buffer.length < 4 || file.buffer.toString('utf8', 0, 4) !== '%PDF') {
      throw new Error('Konten file bukan merupakan dokumen PDF yang valid.');
    }
  } else if (['covers', 'avatars', 'banners'].includes(subdirectory)) {
    // Disallow SVG or HTML embedded in image uploads
    const headerStr = file.buffer.toString('utf8', 0, Math.min(file.buffer.length, 100)).toLowerCase();
    if (headerStr.includes('<svg') || headerStr.includes('<?xml') || headerStr.includes('<script') || headerStr.includes('<html')) {
      throw new Error('File gambar tidak valid atau mengandung skrip yang tidak diizinkan.');
    }
  }
}
