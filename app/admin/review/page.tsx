"use client";

import { useEffect, useState } from "react";

type Post = {
  id: string;
  text: string;
  session_id: string;
  ip_hash: string | null;
  created_at: string;
  is_deleted: boolean;
  is_restricted: boolean;
  report_count: number | null;
  display_name: string | null;
  display_icon: string | null;
};

type ReviewAction =
  | "release"
  | "delete"
  | "temporary_ban"
  | "permanent_ban";

export default function AdminReviewPage() {
  const [posts, setPosts] = useState<Post[]>([]);

  async function fetchReviewPosts() {
    const res = await fetch("/api/admin/review", {
      credentials: "include",
    });

    if (res.status === 401) {
      alert("ログインしてください");
      location.href = "/admin";
      return;
    }

    const data = await res.json();
    setPosts(data.posts ?? []);
  }

  async function updatePost(postId: string, action: ReviewAction) {
    const messages: Record<ReviewAction, string> = {
      release: "この投稿の制限を解除しますか？",
      delete: "この投稿を削除しますか？",
      temporary_ban: "このユーザーを1週間制限しますか？",
      permanent_ban: "このユーザーを永久BANしますか？",
    };

    const ok = confirm(messages[action]);
    if (!ok) return;

    const res = await fetch("/api/admin/review", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ postId, action }),
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.message ?? "処理に失敗しました");
      return;
    }

    fetchReviewPosts();
  }

  useEffect(() => {
    fetchReviewPosts();
  }, []);

  return (
    <main style={styles.page}>
      <h1>要確認投稿</h1>

      <a href="/admin" style={styles.back}>
        ← ダッシュボードへ戻る
      </a>

      <div style={styles.list}>
        {posts.length === 0 ? (
          <p>要確認投稿はありません</p>
        ) : (
          posts.map((post) => (
            <article key={post.id} style={styles.card}>
              <p>
                <strong>
                  {post.display_icon ?? "🌙"} {post.display_name ?? "匿名"}
                </strong>
              </p>

              <p style={styles.text}>{post.text}</p>

              <p>通報数: {post.report_count ?? 0}</p>

              <p>
                投稿日時:{" "}
                {new Date(post.created_at).toLocaleString("ja-JP")}
              </p>

              <div style={styles.info}>
                <p>session_id: {post.session_id}</p>
                <p>ip_hash: {post.ip_hash ?? "なし"}</p>
              </div>

              <div style={styles.row}>
                <button
                  onClick={() => updatePost(post.id, "release")}
                  style={styles.green}
                >
                  問題なし・制限解除
                </button>

                <button
                  onClick={() => updatePost(post.id, "delete")}
                  style={styles.delete}
                >
                  投稿削除
                </button>

                <button
                  onClick={() => updatePost(post.id, "temporary_ban")}
                  style={styles.orange}
                >
                  1週間制限
                </button>

                <button
                  onClick={() => updatePost(post.id, "permanent_ban")}
                  style={styles.redDark}
                >
                  永久BAN
                </button>

                <a
                  href={`/admin/users/${post.session_id}`}
                  style={styles.linkButton}
                >
                  ユーザー詳細を見る
                </a>
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    padding: 20,
    background: "#0f172a",
    minHeight: "100vh",
    color: "#fff",
  },
  back: {
    display: "inline-block",
    marginBottom: 20,
    color: "#60a5fa",
  },
  list: {
    display: "grid",
    gap: 12,
  },
  card: {
    background: "#1e293b",
    padding: 16,
    borderRadius: 12,
    border: "1px solid #334155",
  },
  text: {
    fontSize: 16,
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
  },
  info: {
    fontSize: 12,
    color: "#94a3b8",
    wordBreak: "break-all",
  },
  row: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 12,
  },
  green: {
    padding: "8px 12px",
    background: "#22c55e",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  delete: {
    padding: "8px 12px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  orange: {
    padding: "8px 12px",
    background: "#f97316",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  redDark: {
    padding: "8px 12px",
    background: "#991b1b",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  linkButton: {
    padding: "8px 12px",
    background: "#64748b",
    color: "#fff",
    borderRadius: 6,
    textDecoration: "none",
  },
};