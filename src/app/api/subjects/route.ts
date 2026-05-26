import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  const subjects = await prisma.subject.findMany({
    where: {
      userId: user.id
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return NextResponse.json({ subjects });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const color = String(body.color ?? "#18b86f");
  const professor = body.professor ? String(body.professor).trim() : null;
  const room = body.room ? String(body.room).trim() : null;

  if (!name) {
    return NextResponse.json({ error: "Informe o nome da materia." }, { status: 400 });
  }

  const subject = await prisma.subject.create({
    data: {
      userId: user.id,
      name,
      color,
      professor,
      room
    }
  });

  return NextResponse.json({ subject }, { status: 201 });
}
