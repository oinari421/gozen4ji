"use client";

import { useEffect, useState } from "react";

type Theme = {
  id: string;
  text: string;
  target_date: string | null;
  is_active: boolean;
  created_at: string;
};

export default function AdminThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [text, setText] = useState("");
  const [targetDate, setTargetDate] = useState("");

  async function fetchThemes() {
    const res = await fetch("/api/admin/themes", {
      credentials: "include",
    });

    if (res.status === 401) {
      alert("ログインしてください");
      location.href = "/admin";
      return;
    }

    const data = await res.json();
    setThemes(data.themes ?? []);
  }

  useEffect(() => {
    fetchThemes();
  }, []);

  async function addTheme() {
    if (!text.trim()) {
      alert("テーマを入力してください");
      return;
    }

    await fetch("/api/admin/themes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        text,
        targetDate: targetDate || null,
      }),
    });

    setText("");
    setTargetDate("");
    fetchThemes();
  }

  async function activateTheme(id: string) {
    await fetch("/api/admin/themes", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ id }),
    });

    fetchThemes();
  }

  return (
    <main style={styles.page}>
      <h1>今日の問い管理</h1>

      <a href="/admin" style={styles.back}>
        ← ダッシュボードへ戻る
      </a>

      <section style={styles.form}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="例：今夜だけ、誰にも言えない本音は？"
          style={styles.textarea}
        />

        <input
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          style={styles.input}
        />

        <button onClick={addTheme} style={styles.addButton}>
          テーマ追加
        </button>
      </section>

      <h2>テーマ一覧</h2>

      <div style={styles.list}>
        {themes.map((theme) => (
          <div key={theme.id} style={styles.card}>
            <p>{theme.text}</p>

            <p style={styles.meta}>
              日付: {theme.target_date ?? "指定なし"}
            </p>

            {theme.is_active && (
              <span style={styles.activeBadge}>現在使用中</span>
            )}

            {!theme.is_active && (
              <button
                onClick={() => activateTheme(theme.id)}
                style={styles.activateButton}
              >
                今日の問いにする
              </button>
            )}
          </div>
        ))}
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
  back: {
    display: "inline-block",
    marginBottom: 20,
    color: "#93c5fd",
  },
  form: {
    background: "#1e293b",
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  textarea: {
    minHeight: 80,
    padding: 10,
    borderRadius: 6,
  },
  input: {
    padding: 8,
    borderRadius: 6,
  },
  addButton: {
    background: "#2563eb",
    color: "#fff",
    padding: 10,
    border: "none",
    borderRadius: 6,
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
  meta: {
    color: "#94a3b8",
    fontSize: 12,
  },
  activeBadge: {
    display: "inline-block",
    background: "#16a34a",
    padding: "4px 8px",
    borderRadius: 999,
    fontSize: 12,
  },
  activateButton: {
    background: "#f59e0b",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: 6,
  },
};