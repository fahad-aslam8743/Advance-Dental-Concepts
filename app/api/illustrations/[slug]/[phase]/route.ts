import { NextRequest, NextResponse } from "next/server";
import { services } from "@/data/services";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowed = new Set(services.map((service) => service.slug));

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string; phase: string }> }) {
  const { slug, phase } = await context.params;
  if (!allowed.has(slug) || (phase !== "before" && phase !== "after")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const before = phase === "before";
  const pair = request.nextUrl.searchParams.get("pair") === "2" ? 2 : 1;
  const xs = [112,196,280,364,448,532,616,700,784,868];
  const ys = [226,185,157,140,132,132,140,157,185,226];
  const angles = [-19,-13,-8,-3,0,0,3,8,13,19];
  const whitening = slug === "teeth-whitening";
  const aligners = slug === "clear-aligners";
  const implant = slug === "dental-implants";
  const wisdom = slug === "wisdom-tooth-extraction" || slug === "oral-surgery";
  const root = slug === "root-canal-treatment";
  const plaque = slug === "scaling-polishing";
  const cosmetic = slug === "veneers" || slug === "smile-makeover";
  const repair = ["dental-fillings","crowns-bridges","general-dentistry","dental-checkup","minor-oral-surgery"].includes(slug);
  const affected = pair === 1 ? 4 : 5;

  const teeth = xs.map((x,i) => {
    if (before && implant && i === affected) return "";
    const rotation = before && aligners ? angles[i] + (i % 2 ? 9 : -8) : angles[i];
    const fill = before && whitening ? "#c7a66b" : before && root && i === affected ? "#92766c" : before && cosmetic && i >= 3 && i <= 6 ? "#d7c59e" : "#fffdf6";
    return '<g transform="translate('+x+' '+ys[i]+') rotate('+rotation+')"><path d="M-29 -47 C-28 -62 -17 -68 0 -66 C17 -68 28 -62 29 -47 L25 24 C23 45 12 57 0 60 C-12 57 -23 45 -25 24 Z" fill="'+fill+'" stroke="#b9b2a5" stroke-width="3"/>'+
      (before && root && i===affected ? '<ellipse cx="0" cy="-8" rx="10" ry="18" fill="#c96c61"/>' : '')+
      (before && repair && i===affected ? '<path d="M7 -58 L24 -48 L15 -35 L1 -43 Z" fill="#76594b"/><circle cx="0" cy="-18" r="7" fill="#6d5147"/>' : '')+
      (before && plaque ? '<path d="M-24 18 Q0 30 24 18 L22 31 Q0 43 -22 31 Z" fill="#b6a36c"/>' : '')+
      (before && cosmetic && (i===4||i===5) ? '<path d="M-12 -60 L0 -49 L11 -61" stroke="#9c765c" stroke-width="4" fill="none"/>' : '')+
      '</g>';
  }).join("");

  const gum = '<path d="M68 252 Q490 8 912 252 L912 337 Q490 490 68 337 Z" fill="#d98f91"/><path d="M72 248 Q490 15 908 248" fill="none" stroke="#b96670" stroke-width="15" stroke-linecap="round"/>';
  const extra = before && wisdom ? '<g transform="translate(925 286) rotate(42)"><path d="M-23 -42 C-22 -55 -9 -59 0 -58 C12 -58 22 -50 22 -38 L19 17 Q15 44 0 48 Q-15 44 -19 17 Z" fill="#e9d7b9" stroke="#aa9780" stroke-width="3"/></g>' : '';
  const aligner = before && aligners ? '<path d="M92 132 Q490 28 888 132 L878 151 Q490 62 102 151 Z" fill="#b9e7e3" opacity=".72" stroke="#72bdb5" stroke-width="5"/>' : '';
  const post = before && implant ? '<path d="M448 194 L448 252 M440 205 L456 205 M440 218 L456 218 M440 231 L456 231" stroke="#9a9fa1" stroke-width="5" stroke-linecap="round"/>' : '';
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 980 520"><defs><linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#f7faf8"/><stop offset="1" stop-color="#e5efeb"/></linearGradient><radialGradient id="mouth"><stop stop-color="#6d303c"/><stop offset="1" stop-color="#351d2b"/></radialGradient></defs><rect width="980" height="520" rx="30" fill="url(#bg)"/><text x="48" y="58" fill="#42615a" font-family="Arial" font-size="18" font-weight="700" letter-spacing="3">'+(before?'BEFORE · EXAMPLE':'AFTER · EXAMPLE')+'</text><text x="930" y="58" text-anchor="end" fill="#82948c" font-family="Arial" font-size="13">ILLUSTRATION 0'+pair+'</text><g transform="translate(0 20)"><ellipse cx="490" cy="250" rx="430" ry="205" fill="url(#mouth)" stroke="#e3b1aa" stroke-width="16"/>'+gum+'<ellipse cx="490" cy="420" rx="345" ry="34" fill="#b86e79" opacity=".15"/>'+teeth+aligner+extra+post+'</g><text x="490" y="493" text-anchor="middle" fill="#73857d" font-family="Arial" font-size="13">Educational dental illustration · not a patient photograph</text></svg>';

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
