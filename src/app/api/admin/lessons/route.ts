import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { LessonType } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      moduleId,
      title,
      type,
      contentBlocks,
      videoUrl,
      videoThumbnailUrl,
      published,
    } = await req.json();

    if (!moduleId || !title) {
      return NextResponse.json({ error: 'moduleId and title are required.' }, { status: 400 });
    }

    const maxOrder = await prisma.lesson.aggregate({
      where: { moduleId },
      _max: { order: true },
    });
    const nextOrder = (maxOrder._max.order || 0) + 1;

    const lesson = await prisma.lesson.create({
      data: {
        moduleId,
        title,
        order: nextOrder,
        type: (type as LessonType) || LessonType.TEXT,
        contentBlocks: contentBlocks || [],
        videoUrl: videoUrl || null,
        videoThumbnailUrl: videoThumbnailUrl || null,
        published: published || false,
      },
    });

    return NextResponse.json({ lesson });
  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json({ error: 'Failed to create lesson' }, { status: 500 });
  }
}
