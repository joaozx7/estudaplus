import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const subjectId = body.subjectId === undefined ? undefined : body.subjectId ? String(body.subjectId) : null;

  if (subjectId) {
    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        userId: user.id
      }
    });

    if (!subject) {
      return NextResponse.json({ error: "Materia nao encontrada." }, { status: 404 });
    }
  }

  const task = await prisma.studyTask.updateMany({
    where: {
      id,
      userId: user.id
    },
    data: {
      title: body.title ? String(body.title).trim() : undefined,
      description: body.description === undefined ? undefined : String(body.description).trim(),
      status: body.status,
      priority: body.priority,
      subjectId,
      dueDate: body.dueDate === undefined ? undefined : body.dueDate ? new Date(String(body.dueDate)) : null
    }
  });

  if (task.count === 0) {
    return NextResponse.json({ error: "Tarefa nao encontrada." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  const { id } = await context.params;
  const task = await prisma.studyTask.deleteMany({
    where: {
      id,
      userId: user.id
    }
  });

  if (task.count === 0) {
    return NextResponse.json({ error: "Tarefa nao encontrada." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
