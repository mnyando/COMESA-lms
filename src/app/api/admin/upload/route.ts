import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { saveStorageFile } from '@/lib/storage';
import { parsePdfToContentBlocks } from '@/lib/pdf-parser';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';

const execPromise = util.promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (type === 'video') {
      const { url, filepath } = await saveStorageFile(buffer, 'videos', file.name);

      // Extract thumbnail using FFmpeg
      let thumbnailUrl = '/api/storage/thumbnails/default_video_thumb.png';
      try {
        const thumbFilename = `thumb_${Date.now()}.png`;
        const thumbPath = path.join(process.cwd(), 'storage', 'thumbnails', thumbFilename);

        // FFmpeg command to capture single frame at 2 seconds
        await execPromise(`ffmpeg -i "${filepath}" -ss 00:00:02 -vframes 1 "${thumbPath}" -y`);
        thumbnailUrl = `/api/storage/thumbnails/${thumbFilename}`;
      } catch (ffmpegErr) {
        console.warn('FFmpeg thumbnail extraction notice:', ffmpegErr);
      }

      return NextResponse.json({ url, thumbnailUrl });
    }

    if (type === 'pdf') {
      const { url, filepath } = await saveStorageFile(buffer, 'pdfs', file.name);

      // Run PDF structured document parser
      const blocks = await parsePdfToContentBlocks(buffer, file.name);

      return NextResponse.json({ url, blocks });
    }

    return NextResponse.json({ error: 'Invalid upload type' }, { status: 400 });
  } catch (error) {
    console.error('Error during upload/processing:', error);
    return NextResponse.json({ error: 'Upload processing failed' }, { status: 500 });
  }
}
