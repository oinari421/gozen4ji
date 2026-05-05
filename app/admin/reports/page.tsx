"use client";

import { useEffect, useState } from "react";

type Post = {
  id: string;
  text: string;
  session_id: string;
  ip_hash: string | null;
  is_deleted: boolean;
  display_name: string | null;
  display_icon: string | null;
};

type Report = {
  id: string;
  post_id: string;
  reason: string;
  status: "pending" | "resolved" | "rejected";
  created_at: string;
  posts: Post | null;
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);

  async function fetchReports() {
    const res = await fetch("/api/admin/reports", {
      credentials: "include",
    });

    if (res.status === 401) {
      alert("ログインしてください");
      location.href = "/admin";
      return;
    }

    const data = await res.json();
    setReports(data.reports ?? []);
  }

  useEffect(() => {
    fetchReports();
  }, []);

  async function updateStatus(id: string, status: string) {
    await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId: id, status }),
      credentials: "include",
    });

    setReports((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: status as any } : r
      )
    );
  }

  async function deletePost(postId: string) {
    await fetch("/api/admin/delete-post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
      credentials: "include",
    });

    fetchReports();
  }

  return (
    <main style={styles.page}>
      <h1>通報一覧</h1>

      <a href="/admin">← 戻る</a>

      <div style={styles.list}>
        {reports.length === 0 ? (
          <p>通報なし</p>
        ) : (
          reports.map((r) => (
            <div key={r.id} style={styles.card}>
              <p>
                <strong>
                  {r.posts?.display_icon ?? "🌙"}{" "}
                  {r.posts?.display_name ?? "匿名"}
                </strong>
              </p>

              <p>{r.posts?.text ?? "投稿なし"}</p>

              <p>理由: {r.reason}</p>
              <p>状態: {r.status}</p>

              <div style={styles.info}>
                <p>session: {r.posts?.session_id}</p>
                <p>ip: {r.posts?.ip_hash}</p>
              </div>

              <div style={styles.row}>
                {r.posts && !r.posts.is_deleted && (
                  <button onClick={() => deletePost(r.posts!.id)}>
                    投稿削除
                  </button>
                )}

                <button onClick={() => updateStatus(r.id, "resolved")}>
                  対応済み
                </button>

                <button onClick={() => updateStatus(r.id, "rejected")}>
                  問題なし
                </button>
              </div>
            </div>
          ))
        )}
      </div>
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
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  card: {
    background: "#1e293b",
    padding: 10,
    borderRadius: 8,
  },
  row: {
    display: "flex",
    gap: 10,
    marginTop: 10,
  },
  info: {
    fontSize: 12,
    color: "#aaa",
  },
};