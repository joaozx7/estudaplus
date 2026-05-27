import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  const goals = await prisma.goal.findMany({
    where: {
      userId: user.id
    },
    include: {
      subject: true
    },
    orderBy: {
      dueDate: "asc"
    }
  });

  return NextResponse.json({ goals });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const title = String(body.title ?? "").trim();
  const subjectId = body.subjectId ? String(body.subjectId) : null;
  const targetValue = Number(body.targetValue);
  const currentValue = body.currentValue === undefined ? 0 : Number(body.currentValue);
  const unit = String(body.unit ?? "").trim();
  const dueDate = body.dueDate ? new Date(String(body.dueDate)) : null;

  if (!title) {
    return NextResponse.json({ error: "Informe o titulo da meta." }, { status: 400 });
  }

  if (!Number.isInteger(targetValue) || targetValue <= 0) {
    return NextResponse.json({ error: "Informe um alvo valido para a meta." }, { status: 400 });
  }

  if (!Number.isInteger(currentValue) || currentValue < 0) {
    return NextResponse.json({ error: "Informe um progresso valido." }, { status: 400 });
  }

  if (!unit) {
    return NextResponse.json({ error: "Informe a unidade da meta." }, { status: 400 });
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

  const goal = await prisma.goal.create({
    data: {
      userId: user.id,
      subjectId,
      title,
      targetValue,
      currentValue,
      unit,
      dueDate
    },
    include: {
      subject: true
    }
  });

  return NextResponse.json({ goal }, { status: 201 });
}
