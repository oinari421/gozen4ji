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

function getJapanDateKey() {
  const now = getJapanNow();

  return now.toISOString().slice(0, 10);
}

export function getAnonymousIdentity(sessionId: string) {
  const dateKey = getJapanDateKey();
  const hash = hashString(`${sessionId}-${dateKey}`);

  return {
    icon: icons[hash % icons.length],
    name: names[hash % names.length],
  };
}