import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { resolveStorageFilePath } from '@/lib/storage';

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const subPath = params.path.join('/');
  const filePath = resolveStorageFilePath(subPath);

  if (!filePath || !fs.existsSync(filePath)) {
    return new NextResponse('File not found', { status: 404 });
  }

  const stat = fs.statSync(filePath);
  const ext = path.extname(filePath).toLowerCase();

  const mimeTypes: Record<string, string> = {
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.ogg': 'video/ogg',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';
  const range = req.headers.get('range');

  // Video byte-range streaming support for media scrubbing
  if (range && contentType.startsWith('video/')) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
    const chunksize = end - start + 1;
    const fileStream = fs.createReadStream(filePath, { start, end });

    return new NextResponse(fileStream as unknown as BodyInit, {
      status: 206,
      headers: {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize.toString(),
        'Content-Type': contentType,
      },
    });
  }

  const fileStream = fs.createReadStream(filePath);
  return new NextResponse(fileStream as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Length': stat.size.toString(),
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
