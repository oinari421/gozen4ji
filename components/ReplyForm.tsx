"use client";

import { useState } from "react";
import { getSessionId } from "@/lib/session";

type Props = {
  postId: string;
  onReplied?: () => void;
};

export default function ReplyForm({ postId, onReplied }: Props) {
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReply() {
    setLoading(true);
    setMessage("");

    try {
      const sessionId = getSessionId();

      const res = await fetch("/api/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          text,
          sessionId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "返信に失敗しました。");
        setLoading(false);
        return;
      }

      setMessage("返事を届けました。");
      setText("");
      onReplied?.();
    } catch (error) {
      console.error(error);
      setMessage("エラーが発生しました。");
    }

    setLoading(false);
  }

  return (
    <div style={styles.wrap}>
      <textarea
        style={styles.textarea}
        placeholder="少しだけでも眠れますように"
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={140}
      />

      <div style={styles.bottom}>
        <span style={styles.count}>残り {140 - text.length} 文字</span>

        <button style={styles.button} onClick={handleReply} disabled={loading}>
          {loading ? "送信中..." : "返事する"}
        </button>
      </div>

      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
}


const styles: Record<string, React.CSSProperties> = {
  wrap: {
    marginTop: "12px",
    display: "grid",
    gap: "10px",
  },

  textarea: {
    width: "100%",
    minHeight: "80px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    color: "#eef3ff",
    padding: "12px",
    fontSize: "14px",
    resize: "vertical",
    boxSizing: "border-box",
  },

  bottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },

  count: {
    color: "#9da9c7",
    fontSize: "13px",
  },

  button: {
    padding: "8px 14px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(159,194,255,0.18)",
    color: "#eef3ff",
    cursor: "pointer",
    fontSize: "14px",
  },

  message: {
    margin: 0,
    color: "#9da9c7",
    fontSize: "13px",
  },
};