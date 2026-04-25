"use client";

import { useEffect, useState } from "react";

type Reply = {
  id: string;
  text: string;
  created_at: string;
};

type Post = {
  id: string;
  text: string;
  reply_count: number;
  replies: Reply[];
};

export default function MyReplyNotice() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    async function fetchMyReplies() {
      const sessionId = localStorage.getItem("gozen4ji_session_id");

      if (!sessionId) return;

      const res = await fetch("/api/my-replies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json();
      setPosts(data.posts || []);
    }

    fetchMyReplies();
  }, []);

  if (posts.length === 0) return null;

  return (
    <div style={styles.card}>
      <p style={styles.title}>返信が届いています</p>

      {posts.map((post) => (
        <div key={post.id} style={styles.item}>
          <p style={styles.postText}>あなたの投稿：{post.text}</p>
          <p style={styles.count}>{post.reply_count}件の返信</p>

          {post.replies.slice(0, 1).map((reply) => (
            <p key={reply.id} style={styles.reply}>
              ↳ {reply.text}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    width: "100%",
    maxWidth: "640px",
    background: "rgba(159,194,255,0.08)",
    border: "1px solid rgba(159,194,255,0.2)",
    borderRadius: "16px",
    padding: "16px",
    marginBottom: "20px",
  },
  title: {
    margin: 0,
    marginBottom: "12px",
    color: "#c9d6ff",
    fontWeight: 700,
  },
  item: {
    borderTop: "1px solid rgba(255,255,255,0.08)",
    paddingTop: "12px",
    marginTop: "12px",
  },
  postText: {
    color: "#eef3ff",
    margin: 0,
  },
  count: {
    color: "#9da9c7",
    fontSize: "14px",
    margin: "6px 0",
  },
  reply: {
    color: "#c9d6ff",
    margin: 0,
  },
};