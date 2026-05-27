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
  const targetValue = body.targetValue === undefined ? undefined : Number(body.targetValue);
  const currentValue = body.currentValue === undefined ? undefined : Number(body.currentValue);

  if (targetValue !== undefined && (!Number.isInteger(targetValue) || targetValue <= 0)) {
    return NextResponse.json({ error: "Informe um alvo valido para a meta." }, { status: 400 });
  }

  if (currentValue !== undefined && (!Number.isInteger(currentValue) || currentValue < 0)) {
    return NextResponse.json({ error: "Informe um progresso valido." }, { status: 400 });
  }

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

  const goal = await prisma.goal.updateMany({
    where: {
      id,
      userId: user.id
    },
    data: {
      title: body.title ? String(body.title).trim() : undefined,
      subjectId,
      targetValue,
      currentValue,
      unit: body.unit ? String(body.unit).trim() : undefined,
      dueDate: body.dueDate === undefined ? undefined : body.dueDate ? new Date(String(body.dueDate)) : null
    }
  });

  if (goal.count === 0) {
    return NextResponse.json({ error: "Meta nao encontrada." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  const { id } = await context.params;
  const goal = await prisma.goal.deleteMany({
    where: {
      id,
      userId: user.id
    }
  });

  if (goal.count === 0) {
    return NextResponse.json({ error: "Meta nao encontrada." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
