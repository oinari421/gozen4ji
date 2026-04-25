"use client";

import { useEffect, useState } from "react";

type Reply = {
  id: string;
  text: string;
  created_at: string;
  display_name?: string;
  display_icon?: string;
};

type Empathy = {
  id: string;
  created_at: string;
  display_name?: string;
  display_icon?: string;
};

type Post = {
  id: string;
  text: string;
  created_at: string;
  reply_count?: number;
  empathy_count?: number;
  replies?: Reply[];
  empathies?: Empathy[];
};

export default function MyPostsView() {
  const [posts, setPosts] = useState<Post[]>([]);

  async function fetchMyPosts() {
    const sessionId = localStorage.getItem("gozen4ji_session_id");

    if (!sessionId) return;

    const res = await fetch("/api/my-posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionId }),
    });

    const data = await res.json();
    setPosts(data.posts || []);
  }

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const hasNotification = posts.some(
    (post) => (post.replies?.length || 0) > 0 || (post.empathies?.length || 0) > 0
  );

  return (
    <div style={styles.card}>
      <div style={styles.topRow}>
        <h2 style={styles.heading}>自分の投稿</h2>

        <button style={styles.button} onClick={fetchMyPosts}>
          更新
        </button>
      </div>

      {hasNotification && (
        <div style={styles.notice}>
          あなたの言葉に、返事や共感が届いています。
        </div>
      )}

      {posts.length === 0 ? (
        <p style={styles.subtext}>まだ今日の投稿はありません。</p>
      ) : (
        <div style={styles.list}>
          {posts.map((post) => (
            <div key={post.id} style={styles.post}>
              <p style={styles.postText}>{post.text}</p>

              {(post.replies?.length || 0) > 0 && (
                <div style={styles.replyBox}>
                  <div style={styles.replyLabel}>返事が届きました</div>

                  {post.replies?.map((reply) => (
                    <div key={reply.id} style={styles.reactionItem}>
                      <div style={styles.person}>
                        <span>{reply.display_icon || "🌙"}</span>
                        <span>{reply.display_name || "誰か"}</span>
                        <span style={styles.fromText}>から返事</span>
                      </div>

                      <p style={styles.replyText}>↳ {reply.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {(post.empathies?.length || 0) > 0 && (
                <div style={styles.empathyBox}>
                  <div style={styles.replyLabel}>
                    共感 {post.empathies?.length || 0}件
                  </div>

                  <div style={styles.peopleList}>
                    {post.empathies?.slice(0, 8).map((empathy) => (
                      <span key={empathy.id} style={styles.personChip}>
                        {empathy.display_icon || "🌙"}{" "}
                        {empathy.display_name || "誰か"}
                      </span>
                    ))}
                  </div>

                  {(post.empathies?.length || 0) > 8 && (
                    <p style={styles.moreText}>
                      ほか {(post.empathies?.length || 0) - 8}人
                    </p>
                  )}
                </div>
              )}

              {(post.replies?.length || 0) === 0 &&
                (post.empathies?.length || 0) === 0 && (
                  <p style={styles.noReply}>まだ反応はありません。</p>
                )}
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
  notice: {
    marginBottom: "16px",
    padding: "12px",
    borderRadius: "12px",
    background: "rgba(159,194,255,0.12)",
    border: "1px solid rgba(159,194,255,0.22)",
    color: "#c9d6ff",
  },
  subtext: {
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
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
  },
  postText: {
    margin: 0,
    fontSize: "16px",
    color: "#eef3ff",
  },
  replyBox: {
    marginTop: "12px",
    padding: "12px",
    borderRadius: "12px",
    background: "rgba(159,194,255,0.08)",
    border: "1px solid rgba(159,194,255,0.14)",
  },
  empathyBox: {
    marginTop: "12px",
    padding: "12px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  replyLabel: {
    color: "#9da9c7",
    fontSize: "12px",
    marginBottom: "8px",
  },
  reactionItem: {
    marginTop: "8px",
  },
  person: {
    display: "flex",
    gap: "6px",
    alignItems: "center",
    color: "#c9d6ff",
    fontSize: "13px",
    marginBottom: "6px",
  },
  fromText: {
    color: "#9da9c7",
  },
  replyText: {
    margin: 0,
    fontSize: "14px",
    color: "#eef3ff",
  },
  peopleList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  personChip: {
    padding: "6px 10px",
    borderRadius: "999px",
    background: "rgba(159,194,255,0.1)",
    color: "#c9d6ff",
    fontSize: "13px",
  },
  moreText: {
    margin: "8px 0 0",
    color: "#9da9c7",
    fontSize: "13px",
  },
  noReply: {
    marginTop: "10px",
    color: "#9da9c7",
    fontSize: "14px",
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