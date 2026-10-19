import { NextResponse } from "next/server";
import {
  COOKIE_NAO_CONTAR,
  VALIDADE_NAO_CONTAR_S,
  htmlNaoContar,
} from "@/lib/nao-contar";

export const dynamic = "force-dynamic";

/**
 * Marca este navegador para não entrar na contagem de visitas (ver
 * @/lib/nao-contar). `?desfazer=1` volta a contar.
 */
export function GET(request: Request) {
  const desfazer = new URL(request.url).searchParams.has("desfazer");
  const resposta = new NextResponse(htmlNaoContar("Chip Viagem", desfazer, request.headers.get("x-nonce")), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });
  if (desfazer) {
    resposta.cookies.delete(COOKIE_NAO_CONTAR);
  } else {
    resposta.cookies.set(COOKIE_NAO_CONTAR, "1", {
      maxAge: VALIDADE_NAO_CONTAR_S,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    });
  }
  return resposta;
}
