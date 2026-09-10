import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { courseId, orderedIds } = await req.json();

    if (!courseId || !Array.isArray(orderedIds)) {
      return NextResponse.json(
        { error: 'courseId and orderedIds array are required.' },
        { status: 400 }
      );
    }

    // Execute bulk update within a single database transaction
    await prisma.$transaction(
      orderedIds.map((id: string, index: number) =>
        prisma.module.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error reordering modules:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reorder modules' },
      { status: 500 }
    );
  }
}
