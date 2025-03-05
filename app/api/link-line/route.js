import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // ✅ ตรวจสอบ path ให้ถูกต้อง

const prisma = new PrismaClient();

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { lineUid } = await req.json();
  if (!lineUid) {
    return new Response(JSON.stringify({ error: "LINE UID is required" }), { status: 400 });
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { lineuid: lineUid },
    });

    return new Response(JSON.stringify({ success: true, message: "LINE linked successfully" }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error linking LINE UID:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
