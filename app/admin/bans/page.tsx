"use client";

import { useEffect, useState } from "react";

type Ban = {
  id: string;
  ip_hash: string;
  reason: string | null;
  created_at: string;
};

export default function AdminBansPage() {
  const [bans, setBans] = useState<Ban[]>([]);

  async function fetchBans() {
    const res = await fetch("/api/admin/ban", {
      credentials: "include",
    });

    if (res.status === 401) {
      alert("ログインしてください");
      location.href = "/admin";
      return;
    }

    const data = await res.json();
    setBans(data.bans ?? []);
  }

  async function unban(id: string) {
    const ok = confirm("BANを解除しますか？");
    if (!ok) return;

    await fetch("/api/admin/ban", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ id }),
    });

    fetchBans();
  }

  useEffect(() => {
    fetchBans();
  }, []);

  return (
    <main style={styles.page}>
      <h1>BAN一覧</h1>

      <a href="/admin" style={styles.back}>
        ← ダッシュボードへ戻る
      </a>

      <div style={styles.list}>
        {bans.length === 0 ? (
          <p>現在BAN中のIPはありません</p>
        ) : (
          bans.map((ban) => (
            <article key={ban.id} style={styles.card}>
              <p>
                <strong>ip_hash:</strong> {ban.ip_hash}
              </p>

              <p>
                <strong>理由:</strong> {ban.reason ?? "なし"}
              </p>

              <p>
                <strong>BAN日時:</strong>{" "}
                {new Date(ban.created_at).toLocaleString("ja-JP")}
              </p>

              <button onClick={() => unban(ban.id)} style={styles.green}>
                BAN解除
              </button>
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
  green: {
    marginTop: 10,
    padding: "8px 12px",
    background: "#22c55e",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
};