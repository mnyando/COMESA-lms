import fs from 'fs';
import path from 'path';

const BASE_STORAGE_DIR = process.env.STORAGE_DIR
  ? path.isAbsolute(process.env.STORAGE_DIR)
    ? process.env.STORAGE_DIR
    : path.join(process.cwd(), process.env.STORAGE_DIR)
  : path.join(process.cwd(), 'storage');

export function ensureStorageDirs() {
  const dirs = ['videos', 'pdfs', 'thumbnails', 'images'];
  for (const dir of dirs) {
    const fullPath = path.join(BASE_STORAGE_DIR, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  }
}

export async function saveStorageFile(
  fileBuffer: Buffer,
  subFolder: 'videos' | 'pdfs' | 'thumbnails' | 'images',
  originalFilename: string
): Promise<{ url: string; filepath: string }> {
  ensureStorageDirs();
  const ext = path.extname(originalFilename) || '.bin';
  const cleanBase = path.basename(originalFilename, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${Date.now()}_${cleanBase}${ext}`;
  const targetPath = path.join(BASE_STORAGE_DIR, subFolder, filename);

  await fs.promises.writeFile(targetPath, fileBuffer);
  const url = `/api/storage/${subFolder}/${filename}`;
  return { url, filepath: targetPath };
}

export function resolveStorageFilePath(urlPath: string): string | null {
  if (!urlPath || !urlPath.startsWith('/api/storage/')) {
    return null;
  }
  const cleanUrl = urlPath.replace(/^\/api\/storage\//, '');
  const targetPath = path.join(BASE_STORAGE_DIR, cleanUrl);

  // Prevent directory traversal attacks
  if (!targetPath.startsWith(BASE_STORAGE_DIR)) {
    return null;
  }
  return targetPath;
}

export async function deleteStorageFile(urlPath?: string | null): Promise<boolean> {
  if (!urlPath) return false;
  const filePath = resolveStorageFilePath(urlPath);
  if (filePath && fs.existsSync(filePath)) {
    try {
      await fs.promises.unlink(filePath);
      return true;
    } catch (err) {
      console.warn(`Failed to delete storage file ${filePath}:`, err);
    }
  }
  return false;
}

export async function cleanupLessonFiles(lesson: any) {
  if (!lesson) return;
  if (lesson.videoUrl) await deleteStorageFile(lesson.videoUrl);
  if (lesson.videoThumbnailUrl) await deleteStorageFile(lesson.videoThumbnailUrl);
  if (lesson.sourceFileUrl) await deleteStorageFile(lesson.sourceFileUrl);

  // Clean up embedded images inside contentBlocks if stored locally
  if (Array.isArray(lesson.contentBlocks)) {
    for (const block of lesson.contentBlocks) {
      if (block.type === 'image' && block.url) {
        await deleteStorageFile(block.url);
      }
    }
  }
}
