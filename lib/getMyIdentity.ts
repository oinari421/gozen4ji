import { getDayKey } from "@/lib/time";

export async function getMyIdentity() {
  const key = "gozen4ji_session_id";

  let sessionId = localStorage.getItem(key);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(key, sessionId);
  }

  const daySessionId = `${sessionId}_${getDayKey()}`;

  const res = await fetch("/api/identity", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      session_id: daySessionId,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "名前の取得に失敗しました。");
  }

  return data as {
    name: string;
    icon: string;
  };
}