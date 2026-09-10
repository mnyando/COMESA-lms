import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cleanupLessonFiles, deleteStorageFile } from '@/lib/storage';
import { slugify } from '@/lib/slugify';

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
    const { title, description, category, coverImage, published, slug: customSlug } = body;

    // Check slug uniqueness if title or custom slug is updated
    let targetSlug: string | undefined = undefined;
    if (customSlug) {
      targetSlug = slugify(customSlug);
    } else if (title) {
      targetSlug = slugify(title);
    }

    if (targetSlug) {
      const existingCourse = await prisma.course.findFirst({
        where: {
          slug: targetSlug,
          NOT: { id: params.id },
        },
      });

      if (existingCourse) {
        return NextResponse.json(
          { error: `A course with the slug "${targetSlug}" already exists.` },
          { status: 409 }
        );
      }
    }

    const course = await prisma.course.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(targetSlug !== undefined && { slug: targetSlug }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(coverImage !== undefined && { coverImage }),
        ...(published !== undefined && { published }),
      },
    });

    return NextResponse.json(course);
  } catch (error: any) {
    console.error('Error updating course:', error);
    return NextResponse.json({ error: error.message || 'Failed to update course' }, { status: 500 });
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

    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        modules: {
          include: {
            lessons: true,
          },
        },
      },
    });

    if (course) {
      // Clean up storage files for all lessons across all modules in this course
      for (const mod of course.modules) {
        for (const lesson of mod.lessons) {
          await cleanupLessonFiles(lesson);
        }
      }
      if (course.coverImage) {
        await deleteStorageFile(course.coverImage);
      }

      await prisma.course.delete({
        where: { id: params.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting course:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete course' }, { status: 500 });
  }
}
