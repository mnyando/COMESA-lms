import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, order } = body;

    const moduleItem = await prisma.module.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(order !== undefined && { order: Number(order) }),
      },
    });

    return NextResponse.json(moduleItem);
  } catch (error: any) {
    console.error('Error updating module:', error);
    return NextResponse.json({ error: error.message || 'Failed to update module' }, { status: 500 });
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.module.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting module:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete module' }, { status: 500 });
  }
}
