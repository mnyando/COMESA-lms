import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lessonId, completed, lastPositionSeconds } = await req.json();

    if (!lessonId) {
      return NextResponse.json({ error: 'lessonId is required' }, { status: 400 });
    }

    const progress = await prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId,
        },
      },
      update: {
        completed: completed !== undefined ? completed : undefined,
        lastPositionSeconds: lastPositionSeconds !== undefined ? lastPositionSeconds : undefined,
        completedAt: completed ? new Date() : null,
      },
      create: {
        userId: user.id,
        lessonId,
        completed: completed || false,
        lastPositionSeconds: lastPositionSeconds || 0,
        completedAt: completed ? new Date() : null,
      },
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}
