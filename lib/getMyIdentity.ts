export async function getMyIdentity() {
  const key = "gozen4ji_session_id";

  let sessionId = localStorage.getItem(key);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(key, sessionId);
  }

  const now = new Date();

  if (now.getHours() < 4) {
    now.setDate(now.getDate() - 1);
  }

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const todayKey = `${year}-${month}-${day}`;

  const daySessionId = `${sessionId}_${todayKey}`;

  const res = await fetch("/api/identity", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sessionId: daySessionId,
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