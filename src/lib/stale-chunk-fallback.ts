import { NextRequest, NextResponse } from "next/server";

export function rewriteStaleCssChunk(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (!pathname.startsWith("/_next/static/chunks/")) return null;

  const file = pathname.split("/").pop();
  if (!file?.endsWith(".css")) return null;

  const primaryCss = process.env.PRIMARY_CSS_CHUNK?.trim();
  if (!primaryCss || file === primaryCss) return null;

  const url = request.nextUrl.clone();
  url.pathname = `/_next/static/chunks/${primaryCss}`;
  return NextResponse.rewrite(url);
}
