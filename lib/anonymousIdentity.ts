import { getJapanNow } from "@/lib/time";

const icons = ["🌙", "🐈", "🌊", "☁️", "⭐", "🕯️", "🦉", "🫧", "🌌", "🪐"];

const names = [
  "月のしずく",
  "夜ふかし猫",
  "静かな波",
  "眠れぬ雲",
  "星のかけら",
  "小さな灯り",
  "夜のふくろう",
  "泡のひと",
  "深夜の影",
  "夜明け前",
];

function hashString(value: string) {
  let hash = 0;

  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash);
}

function getTodayKey() {
  const now = getJapanNow();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getAnonymousIdentity(sessionId: string) {
  const todayKey = getTodayKey();

  if (typeof window !== "undefined") {
    const storageKey = `anonymous_identity_${todayKey}`;
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      return JSON.parse(saved);
    }

    const hash = hashString(`${sessionId}-${todayKey}`);

    const identity = {
      icon: icons[hash % icons.length],
      name: names[hash % names.length],
    };

    localStorage.setItem(storageKey, JSON.stringify(identity));

    return identity;
  }

  const hash = hashString(`${sessionId}-${todayKey}`);

  return {
    icon: icons[hash % icons.length],
    name: names[hash % names.length],
  };
}