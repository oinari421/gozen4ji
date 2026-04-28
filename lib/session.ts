import crypto from "crypto";
import { getDayKey } from "@/lib/time";

export function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex");
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "0.0.0.0";
}

export function getSessionId() {
  if (typeof window === "undefined") return "server";

  const key = "gozen4ji_session_id";
  let value = localStorage.getItem(key);

  if (!value) {
    value = crypto.randomUUID();
    localStorage.setItem(key, value);
  }

  return `${value}_${getDayKey()}`;
}