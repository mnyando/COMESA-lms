import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId, lessonId, published } = await req.json();

    if (courseId) {
      const course = await prisma.course.update({
        where: { id: courseId },
        data: { published },
      });
      return NextResponse.json({ course });
    }

    if (lessonId) {
      const lesson = await prisma.lesson.update({
        where: { id: lessonId },
        data: { published },
      });
      return NextResponse.json({ lesson });
    }

    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  } catch (error) {
    console.error('Error toggling publish state:', error);
    return NextResponse.json({ error: 'Failed to update publish state' }, { status: 500 });
  }
}
