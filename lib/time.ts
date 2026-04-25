export function getJapanNow(): Date {
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