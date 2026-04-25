import crypto from "crypto";

export function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex");
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "0.0.0.0";
}