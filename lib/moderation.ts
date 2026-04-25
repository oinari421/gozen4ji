// lib/moderation.ts

const ngWords = [
  "死ね",
  "しね",
  "消えろ",
  "殺す",
  "ころす",
  "きもい",
  "キモい",
  "うざい",
  "クズ",
  "ゴミ",
  "ばか",
  "バカ",
  "アホ",
];

const negativeWords = [
  "最悪",
  "もう無理",
  "終わり",
  "消えたい",
  "死にたい",
  "つらすぎる",
];

export function validatePostText(text: string) {
  const normalized = text
    .toLowerCase()
    .replace(/\s/g, "")
    .replace(/[！!？?。、「」]/g, "");

  if (!text.trim()) {
    return {
      ok: false,
      message: "何か一言書いてください。",
    };
  }

  if (text.length > 140) {
    return {
      ok: false,
      message: "140文字以内で投稿してください。",
    };
  }

  const hitNgWord = ngWords.find((word) =>
    normalized.includes(word.toLowerCase())
  );

  if (hitNgWord) {
    return {
      ok: false,
      message: "強い言葉が含まれているため投稿できません。",
    };
  }

  const hitNegativeWord = negativeWords.find((word) =>
    normalized.includes(word.toLowerCase())
  );

  if (hitNegativeWord) {
    return {
      ok: false,
      message: "この場所では、少しやさしい言葉に言い換えて投稿してください。",
    };
  }

  return {
    ok: true,
    message: "",
  };
}