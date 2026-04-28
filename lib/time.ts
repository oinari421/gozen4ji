const DEBUG_DATE = null;
// const DEBUG_DATE = "2026-04-28T12:00:00+09:00";

export function getJapanNow(): Date {
  if (DEBUG_DATE) {
    return new Date(DEBUG_DATE);
  }

  const now = new Date();

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));

  return new Date(
    `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}:${map.second}+09:00`
  );
}

export function getDayKey(): string {
  const now = getJapanNow();

  if (now.getHours() < 4) {
    now.setDate(now.getDate() - 1);
  }

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function isOpenNow(): boolean {
  return true;
}

export function getNextOpenRemaining() {
  const now = getJapanNow();

  const next = new Date(now);

  if (now.getHours() < 1) {
    next.setHours(1, 0, 0, 0);
  } else {
    next.setDate(next.getDate() + 1);
    next.setHours(1, 0, 0, 0);
  }

  const diff = next.getTime() - now.getTime();

  const hours = Math.floor(diff / 1000 / 60 / 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);

  return { hours, minutes };
}