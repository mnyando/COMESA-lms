import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title } = await req.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
    }

    const maxOrder = await prisma.module.aggregate({
      where: { courseId: params.id },
      _max: { order: true },
    });

    const nextOrder = (maxOrder._max.order || 0) + 1;

    const moduleRecord = await prisma.module.create({
      data: {
        courseId: params.id,
        title,
        order: nextOrder,
      },
    });

    return NextResponse.json({ module: moduleRecord });
  } catch (error) {
    console.error('Error creating module:', error);
    return NextResponse.json({ error: 'Failed to create module' }, { status: 500 });
  }
}
