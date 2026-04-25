export function validatePostText(text: string): string | null {
  const trimmed = text.trim();

  if (!trimmed) {
    return "内容を入力してください。";
  }

  if (trimmed.length > 140) {
    return "140文字以内で入力してください。";
  }

  if (
    trimmed.includes("http://") ||
    trimmed.includes("https://") ||
    trimmed.includes("www.")
  ) {
    return "URLは投稿できません。";
  }

  return null;
}