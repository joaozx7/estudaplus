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

  const subject = await prisma.subject.updateMany({
    where: {
      id,
      userId: user.id
    },
    data: {
      name: body.name ? String(body.name).trim() : undefined,
      color: body.color ? String(body.color) : undefined,
      professor: body.professor === undefined ? undefined : String(body.professor).trim(),
      room: body.room === undefined ? undefined : String(body.room).trim()
    }
  });

  if (subject.count === 0) {
    return NextResponse.json({ error: "Materia nao encontrada." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  const { id } = await context.params;
  const subject = await prisma.subject.deleteMany({
    where: {
      id,
      userId: user.id
    }
  });

  if (subject.count === 0) {
    return NextResponse.json({ error: "Materia nao encontrada." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
