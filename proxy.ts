import { NextResponse, type NextRequest } from "next/server";

const pageRoleMap: Record<string, string[]> = {
  "/surgery-centers/dashboard": ["SURGERY_CENTER"],
  "/anesthesiologists/workspace": ["ANESTHESIOLOGIST"],
  "/patients/portal": ["PATIENT"],
  "/admin": ["ADMIN"],
};

const apiRoleMap: Record<string, string[]> = {
  "/api/referrals/create": ["SURGERY_CENTER", "ADMIN"],
  "/api/reports/one-page": ["ANESTHESIOLOGIST", "SURGERY_CENTER", "ADMIN"],
  "/api/messages/send": ["PATIENT", "ANESTHESIOLOGIST", "SURGERY_CENTER", "ADMIN"],
};

function matchRoles(pathname: string, map: Record<string, string[]>): string[] | null {
  const entry = Object.entries(map).find(([prefix]) => pathname.startsWith(prefix));
  return entry ? entry[1] : null;
}

function proxy(request: NextRequest) {
  const role = request.cookies.get("getpreop_role")?.value;
  const { pathname } = request.nextUrl;

  const requiredPageRoles = matchRoles(pathname, pageRoleMap);
  if (requiredPageRoles && (!role || !requiredPageRoles.includes(role))) {
    const deniedUrl = new URL("/access-denied", request.url);
    deniedUrl.searchParams.set("required", requiredPageRoles.join(", "));
    deniedUrl.searchParams.set("current", role ?? "none");
    return NextResponse.redirect(deniedUrl);
  }

  const requiredApiRoles = matchRoles(pathname, apiRoleMap);
  if (requiredApiRoles && (!role || !requiredApiRoles.includes(role))) {
    return NextResponse.json(
      {
        error: "Forbidden",
        requiredRoles: requiredApiRoles,
        currentRole: role ?? null,
      },
      { status: 403 },
    );
  }

  return NextResponse.next();
}

export { proxy };
export default proxy;

export const config = {
  matcher: [
    "/surgery-centers/dashboard/:path*",
    "/anesthesiologists/workspace/:path*",
    "/patients/portal/:path*",
    "/admin/:path*",
    "/api/referrals/create",
    "/api/reports/one-page",
    "/api/messages/send",
  ],
};
