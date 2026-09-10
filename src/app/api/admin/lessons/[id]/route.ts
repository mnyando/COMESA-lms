import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { LessonType } from '@prisma/client';
import { cleanupLessonFiles } from '@/lib/storage';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: params.id },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    return NextResponse.json(lesson);
  } catch (error: any) {
    console.error('Error fetching lesson:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch lesson' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const body = await req.json();
    const { title, type, contentBlocks, videoUrl, videoThumbnailUrl, published } = body;

    const lesson = await prisma.lesson.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(type !== undefined && { type: type as LessonType }),
        ...(contentBlocks !== undefined && { contentBlocks }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(videoThumbnailUrl !== undefined && { videoThumbnailUrl }),
        ...(published !== undefined && { published }),
      },
    });

    return NextResponse.json(lesson);
  } catch (error: any) {
    console.error('Error updating lesson:', error);
    return NextResponse.json({ error: error.message || 'Failed to update lesson' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: params.id },
    });

    if (lesson) {
      await cleanupLessonFiles(lesson);
      await prisma.lesson.delete({
        where: { id: params.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting lesson:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete lesson' }, { status: 500 });
  }
}
