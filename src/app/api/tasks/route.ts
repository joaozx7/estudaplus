import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  const tasks = await prisma.studyTask.findMany({
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

  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const title = String(body.title ?? "").trim();
  const description = body.description ? String(body.description).trim() : null;
  const subjectId = body.subjectId ? String(body.subjectId) : null;
  const dueDate = body.dueDate ? new Date(String(body.dueDate)) : null;
  const priority = body.priority ?? "MEDIUM";

  if (!title) {
    return NextResponse.json({ error: "Informe o titulo da tarefa." }, { status: 400 });
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

  const task = await prisma.studyTask.create({
    data: {
      userId: user.id,
      subjectId,
      title,
      description,
      dueDate,
      priority
    },
    include: {
      subject: true
    }
  });

  return NextResponse.json({ task }, { status: 201 });
}
