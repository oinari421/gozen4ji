"use client";

import { useState } from "react";

export default function PostForm({ onPosted }: { onPosted?: () => void }) {
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
  setMessage("");

  const result = validatePostText(text);

  if (!result.ok) {
    setMessage(result.message);
    return;
  }

  setLoading(true);
function validatePostText(text: string) {
  const normalized = text
    .toLowerCase()
    .replace(/\s/g, "")
    .replace(/[！!？?。、「」『』（）()]/g, "");

  const ngWords = [
    "死ね",
    "しね",
    "消えろ",
    "殺す",
    "ころす",
    "キモい",
    "きもい",
    "うざい",
    "クズ",
    "ゴミ",
    "バカ",
    "ばか",
    "アホ",
  ];

  const negativeWords = [
    "死にたい",
    "消えたい",
    "最悪",
    "もう無理",
    "終わり",
    "つらすぎる",
  ];

  if (!text.trim()) {
    return {
      ok: false,
      message: "何か一言書いてください。",
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
      message: "この場所では、少しやさしい言葉に言い換えてください。",
    };
  }

  return {
    ok: true,
    message: "",
  };
}

  try {
    const sessionId = getSessionId();

    const res = await fetch("/api/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        sessionId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "投稿に失敗しました。");
      return;
    }

    setMessage("投稿できました。");
    setText("");
    onPosted?.();
  } catch (error) {
    console.error(error);
    setMessage("エラーが発生しました。");
  } finally {
    setLoading(false);
  }
}

  return (
    <div style={styles.card}>
      <h2 style={styles.heading}>今の気持ちを一言だけ。</h2>

      <textarea
        style={styles.textarea}
        placeholder="今日は少し疲れた"
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={140}
      />

      <p style={styles.count}>残り {140 - text.length} 文字</p>

      <button style={styles.button} onClick={handleSubmit} disabled={loading}>
        {loading ? "送信中..." : "送る"}
      </button>

      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
}

function getSessionId() {
  if (typeof window === "undefined") return "server";

  const key = "gozen4ji_session_id";
  let value = localStorage.getItem(key);

  if (!value) {
    value = crypto.randomUUID();
    localStorage.setItem(key, value);
  }

  return value;
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    width: "100%",
    maxWidth: "640px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "24px",
  },
  heading: {
    marginTop: 0,
    marginBottom: 16,
    fontSize: "24px",
    color: "#eef3ff",
  },
  textarea: {
    width: "100%",
    minHeight: "120px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    color: "#eef3ff",
    padding: "14px",
    fontSize: "16px",
    resize: "vertical",
    boxSizing: "border-box",
  },
  count: {
    color: "#9da9c7",
    fontSize: "14px",
    marginTop: 10,
  },
  button: {
    marginTop: 12,
    padding: "12px 18px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(159,194,255,0.18)",
    color: "#eef3ff",
    cursor: "pointer",
    fontSize: "16px",
  },
  message: {
    marginTop: 12,
    color: "#9da9c7",
  },
};