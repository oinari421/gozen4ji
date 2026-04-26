"use client";

import { useEffect, useState } from "react";

type Reply = {
  id: string;
  text: string;
};

type Post = {
  id: string;
  text: string;
  reply_count: number;
  empathy_count: number;
  replies?: Reply[];
};

function getSessionId() {
  const key = "gozen4ji_session_id";

  let value = localStorage.getItem(key);

  if (!value) {
    value = crypto.randomUUID();
    localStorage.setItem(key, value);
  }

  return value;
}

export default function MyPostsView() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchMyPosts() {
    try {
      const sessionId = getSessionId();

      const res = await fetch("/api/my-posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json();
      setPosts(data.posts || []);
    } catch (e) {
      console.error(e);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMyPosts();
  }, []);

  if (loading) {
    return <div style={styles.card}>読み込み中...</div>;
  }

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>今日の自分</h2>

      {posts.length === 0 ? (
        <p style={styles.empty}>まだ投稿していません。</p>
      ) : (
        <div style={styles.list}>
          {posts.map((post) => (
            <div key={post.id} style={styles.post}>
              <p style={styles.text}>{post.text}</p>

              <div style={styles.meta}>
                <span>共感 {post.empathy_count || 0}</span>
                <span>返信 {post.reply_count || 0}</span>
              </div>

              {post.replies?.map((reply) => (
                <div key={reply.id} style={styles.reply}>
                  {reply.text}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "24px",
    color: "#eef3ff",
  },
  title: {
    marginTop: 0,
    fontSize: "26px",
  },
  empty: {
    color: "#9da9c7",
  },
  list: {
    display: "grid",
    gap: "12px",
  },
  post: {
    padding: "14px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.03)",
  },
  text: {
    margin: 0,
  },
  meta: {
    display: "flex",
    gap: "14px",
    marginTop: "10px",
    color: "#9da9c7",
    fontSize: "13px",
  },
  reply: {
    marginTop: "10px",
    padding: "10px",
    borderRadius: "10px",
    background: "rgba(159,194,255,0.08)",
  },
};