export function getRoleFromCookieHeader(cookieHeader: string | null): string | undefined {
  if (!cookieHeader) return undefined;

  const token = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("getpreop_role="));

  if (!token) return undefined;
  return token.split("=")[1];
}
