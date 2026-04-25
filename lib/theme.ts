import { getJapanNow } from "@/lib/time";

const themes = [
  "最近少し救われたことは？",
  "まだ誰にも言っていない本音は？",
  "眠れない理由は？",
  "今、誰かに言いたいことは？",
  "今日いちばん疲れた瞬間は？",
  "少しうれしかったことは？",
  "最近、心に残っている言葉は？",
  "今夜だけ正直になるなら？",
  "昔の自分に一言かけるなら？",
  "最近ずっと考えていることは？",
];

const DEBUG_THEME_OFFSET = 0;

function getNightIndex() {
  const now = getJapanNow();

  const base = new Date("2025-01-01T01:00:00+09:00");
  const current = new Date(now);

  if (current.getHours() < 1) {
    current.setDate(current.getDate() - 1);
  }

  current.setHours(1, 0, 0, 0);

  const diff = current.getTime() - base.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  return days + DEBUG_THEME_OFFSET;
}

export function getTonightTheme() {
  const index = getNightIndex();

  return themes[index % themes.length];
}