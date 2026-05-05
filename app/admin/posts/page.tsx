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
  reply_count: number | null;
  empathy_count: number | null;
  display_name: string | null;
  display_icon: string | null;
};

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [date, setDate] = useState("");
  const [keyword, setKeyword] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [status, setStatus] = useState("all");

  async function fetchPosts() {
    setIsLoading(true);

    const params = new URLSearchParams();

    if (date) params.set("date", date);
    if (keyword) params.set("keyword", keyword);
    if (sessionId) params.set("sessionId", sessionId);
    if (status !== "all") params.set("status", status);

    const res = await fetch(`/api/admin/posts?${params.toString()}`, {
      credentials: "include",
    });

    if (res.status === 401) {
      alert("ログインしてください");
      location.href = "/admin";
      return;
    }

    const data = await res.json();
    setPosts(data.posts ?? []);
    setIsLoading(false);
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  async function deletePost(id: string) {
    const ok = confirm("削除しますか？");
    if (!ok) return;

    await fetch("/api/admin/delete-post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ postId: id }),
      credentials: "include",
    });

    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_deleted: true } : p))
    );
  }

  return (
    <main style={styles.page}>
      <h1>全投稿管理</h1>

      <a href="/admin" style={styles.back}>
        ← ダッシュボードへ戻る
      </a>

      <section style={styles.filterBox}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={styles.input}
        />

        <input
          type="text"
          placeholder="本文検索"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={styles.input}
        />

        <input
          type="text"
          placeholder="session_id検索"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          style={styles.input}
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={styles.input}
        >
          <option value="all">全て</option>
          <option value="normal">通常投稿</option>
          <option value="deleted">削除済み</option>
          <option value="restricted">制限中</option>
        </select>

        <button onClick={fetchPosts} style={styles.searchButton}>
          検索
        </button>

        <button
          onClick={() => {
            setDate("");
            setKeyword("");
            setSessionId("");
            setStatus("all");
            setTimeout(fetchPosts, 0);
          }}
          style={styles.clearButton}
        >
          リセット
        </button>
      </section>

      <p style={styles.count}>表示件数: {posts.length}件</p>

      {isLoading ? (
        <p>読み込み中...</p>
      ) : posts.length === 0 ? (
        <p>投稿なし</p>
      ) : (
        <div style={styles.list}>
          {posts.map((post) => (
            <div
              key={post.id}
              style={{
                ...styles.card,
                opacity: post.is_deleted ? 0.5 : 1,
                border: post.is_restricted
                  ? "1px solid #facc15"
                  : "1px solid transparent",
              }}
            >
              <p>
                <strong>
                  {post.display_icon ?? "🌙"} {post.display_name ?? "匿名"}
                </strong>
              </p>

              <p>{post.text}</p>

              <div style={styles.badges}>
                {post.is_deleted && <span style={styles.deleted}>削除済み</span>}
                {post.is_restricted && (
                  <span style={styles.restricted}>制限中</span>
                )}
              </div>

              <div style={styles.meta}>
                <span>共感: {post.empathy_count ?? 0}</span>
                <span>返信: {post.reply_count ?? 0}</span>
                <span>通報: {post.report_count ?? 0}</span>
              </div>

              <div style={styles.info}>
                <p>session: {post.session_id}</p>
                <p>ip: {post.ip_hash ?? "なし"}</p>
                <p>{new Date(post.created_at).toLocaleString("ja-JP")}</p>
              </div>

              {!post.is_deleted && (
                <button
                  onClick={() => deletePost(post.id)}
                  style={styles.delete}
                >
                  削除
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

const styles: any = {
  page: {
    padding: 20,
    background: "#0f172a",
    minHeight: "100vh",
    color: "#fff",
  },
  back: {
    display: "inline-block",
    marginBottom: 20,
    color: "#93c5fd",
  },
  filterBox: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
    padding: 12,
    background: "#1e293b",
    borderRadius: 8,
  },
  input: {
    padding: 8,
    borderRadius: 6,
    border: "1px solid #475569",
  },
  searchButton: {
    padding: "8px 14px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
  },
  clearButton: {
    padding: "8px 14px",
    background: "#64748b",
    color: "#fff",
    border: "none",
    borderRadius: 6,
  },
  count: {
    color: "#cbd5e1",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  card: {
    background: "#1e293b",
    padding: 12,
    borderRadius: 8,
  },
  badges: {
    display: "flex",
    gap: 8,
    marginBottom: 8,
  },
  deleted: {
    background: "#7f1d1d",
    color: "#fff",
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 12,
  },
  restricted: {
    background: "#854d0e",
    color: "#fff",
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 12,
  },
  meta: {
    display: "flex",
    gap: 12,
    fontSize: 12,
    color: "#ccc",
  },
  info: {
    fontSize: 12,
    color: "#aaa",
  },
  delete: {
    marginTop: 10,
    background: "red",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: 6,
  },
};