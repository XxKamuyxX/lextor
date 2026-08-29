import { NextResponse } from "next/server";
import {
  createAdminSession,
  passwordsMatch,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = String(body?.password || "");

    if (!passwordsMatch(password)) {
      return NextResponse.json(
        { ok: false, message: "Senha incorreta." },
        { status: 401 }
      );
    }

    await createAdminSession();
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Erro ao autenticar. Verifique ADMIN_SECRET no .env.local.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
