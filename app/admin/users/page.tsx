"use client";

import { useEffect, useState } from "react";

type User = {
  session_id: string;
  ip_hash: string | null;
  post_count: number;
  latest_post_at: string;
  display_name: string | null;
  display_icon: string | null;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  async function fetchUsers() {
    const res = await fetch("/api/admin/users", {
      credentials: "include",
    });

    if (res.status === 401) {
      alert("ログインしてください");
      location.href = "/admin";
      return;
    }

    const data = await res.json();
    setUsers(data.users ?? []);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <main style={styles.page}>
      <h1>ユーザー一覧</h1>

      <a href="/admin">← 戻る</a>

      <div style={styles.list}>
       {users.length === 0 ? (
  <p>ユーザーなし</p>
) : (
  users.map((user) => (
    <div key={user.session_id} style={styles.card}>
      <p>
        <strong>
          {user.display_icon ?? "🌙"}{" "}
          {user.display_name ?? "匿名"}
        </strong>
      </p>

      <p>投稿数: {user.post_count}</p>

      <p>
        最終投稿:
        {new Date(user.latest_post_at).toLocaleString("ja-JP")}
      </p>

      <div style={styles.info}>
        <p>
          <strong>session:</strong>{" "}
          <a
            href={`/admin/users/${user.session_id}`}
            style={{ color: "#60a5fa" }}
          >
            {user.session_id}
          </a>
        </p>

        <p>ip: {user.ip_hash ?? "なし"}</p>
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
  info: {
    fontSize: 12,
    color: "#aaa",
  },
};