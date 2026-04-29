"use client";

import { useEffect, useState } from "react";
import ReplyForm from "./ReplyForm";
import { getSessionId } from "@/lib/session";

type Reply = {
  id: string;
  text: string;
};

type Post = {
  id: string;
  text: string;
  session_id: string;
  display_name: string;
  display_icon: string;
  replies?: Reply[];
  reply_count?: number;
  empathy_count?: number;
};

export default function LatestPost() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [mySessionId, setMySessionId] = useState("");
  const [message, setMessage] = useState("");

  async function fetchPosts() {
    const sessionId = getSessionId();

    const res = await fetch("/api/random", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionId }),
    });

    const data = await res.json();
    setPosts(data.posts || []);
  }

  async function sendEmpathy(postId: string) {
    setMessage("");

    const sessionId = getSessionId();

    const res = await fetch("/api/empathy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        postId,
        sessionId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "共感に失敗しました。");
      return;
    }

    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? { ...post, empathy_count: data.empathy_count }
          : post
      )
    );
  }

  async function sendReport(postId: string) {
    setMessage("");

    const sessionId = getSessionId();

    const reason = window.prompt(
      "通報理由を入力してください。\n例：攻撃的、スパム、不快"
    );

    if (!reason) return;

    const res = await fetch("/api/report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        postId,
        sessionId,
        reason,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "通報に失敗しました。");
      return;
    }

    setMessage("通報を受け付けました。");
  }

  useEffect(() => {
    const sessionId = getSessionId();
    setMySessionId(sessionId);

    fetchPosts();
  }, []);

  return (
    <div style={styles.card}>
      <div style={styles.topRow}>
        <h2 style={styles.heading}>誰かの一言</h2>

        <button style={styles.button} onClick={fetchPosts}>
          更新
        </button>
      </div>

      {message && <p style={styles.message}>{message}</p>}

      {posts.length === 0 ? (
        <p style={styles.subtext}>まだ投稿はありません。</p>
      ) : (
        <div style={styles.list}>
          {posts.map((post) => {
            const reply = post.replies?.[0];
            const isMine = post.session_id === mySessionId;

            return (
              <div key={post.id} style={styles.post}>
                <div style={styles.identity}>
                  <span>{post.display_icon}</span>
                  <span>{post.display_name}</span>
                </div>

                <p style={styles.postText}>{post.text}</p>

                <div style={styles.actionRow}>
                  <button
                    style={styles.empathyButton}
                    onClick={() => sendEmpathy(post.id)}
                    disabled={isMine}
                  >
                    🌙 共感 {post.empathy_count || 0}
                  </button>

                  <button
                    style={styles.reportButton}
                    onClick={() => sendReport(post.id)}
                    disabled={isMine}
                  >
                    通報
                  </button>
                </div>

                {reply ? (
                  <div style={styles.replyBox}>
                    <div style={styles.replyLabel}>届いた返事</div>
                    <p style={styles.replyText}>{reply.text}</p>
                  </div>
                ) : isMine ? (
                  <p style={styles.myPostLabel}>あなたの投稿です</p>
                ) : (
                  <ReplyForm postId={post.id} onReplied={fetchPosts} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
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

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },

  heading: {
    margin: 0,
    fontSize: "24px",
    color: "#eef3ff",
  },

  subtext: {
    color: "#9da9c7",
  },

  message: {
    color: "#c9d6ff",
    fontSize: "14px",
    marginBottom: "12px",
  },

  list: {
    display: "grid",
    gap: "12px",
    maxHeight: "500px",
    overflowY: "auto",
  },

  post: {
    padding: "14px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.03)",
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
  },

  identity: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    color: "#c9d6ff",
    fontSize: "13px",
    marginBottom: "8px",
  },

  postText: {
    margin: 0,
    fontSize: "16px",
    color: "#eef3ff",
  },

  actionRow: {
    display: "flex",
    gap: "8px",
    marginTop: "12px",
    flexWrap: "wrap",
  },

  empathyButton: {
    padding: "7px 12px",
    borderRadius: "999px",
    border: "1px solid rgba(159,194,255,0.18)",
    background: "rgba(159,194,255,0.1)",
    color: "#c9d6ff",
    cursor: "pointer",
    fontSize: "13px",
  },

  reportButton: {
    padding: "7px 12px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    color: "#9da9c7",
    cursor: "pointer",
    fontSize: "13px",
  },

  myPostLabel: {
    marginTop: "12px",
    color: "#9da9c7",
    fontSize: "14px",
  },

  replyBox: {
    marginTop: "12px",
    padding: "12px",
    borderRadius: "12px",
    background: "rgba(159,194,255,0.08)",
    border: "1px solid rgba(159,194,255,0.14)",
  },

  replyLabel: {
    color: "#9da9c7",
    fontSize: "12px",
    marginBottom: "6px",
  },

  replyText: {
    margin: 0,
    fontSize: "14px",
    color: "#eef3ff",
  },

  button: {
    padding: "8px 14px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(159,194,255,0.18)",
    color: "#eef3ff",
    cursor: "pointer",
  },
};