"use client";

import { useEffect, useState } from "react";

type NgWord = {
  id: string;
  word: string;
  type: string;
  is_active: boolean;
  created_at: string;
};

export default function AdminNgWordsPage() {
  const [words, setWords] = useState<NgWord[]>([]);
  const [newWord, setNewWord] = useState("");
  const [type, setType] = useState("ng");

  async function fetchWords() {
    const res = await fetch("/api/admin/ng-words", {
      credentials: "include",
    });

    if (res.status === 401) {
      alert("ログインしてください");
      location.href = "/admin";
      return;
    }

    const data = await res.json();
    setWords(data.words ?? []);
  }

  useEffect(() => {
    fetchWords();
  }, []);

  async function addWord() {
    if (!newWord.trim()) {
      alert("NGワードを入力してください");
      return;
    }

    const res = await fetch("/api/admin/ng-words", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        word: newWord,
        type,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.message ?? "追加に失敗しました");
      return;
    }

    setNewWord("");
    setType("ng");
    fetchWords();
  }

  async function toggleWord(id: string, isActive: boolean) {
    await fetch("/api/admin/ng-words", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        id,
        isActive: !isActive,
      }),
    });

    fetchWords();
  }

  return (
    <main style={styles.page}>
      <h1>NGワード管理</h1>

      <a href="/admin" style={styles.back}>
        ← ダッシュボードへ戻る
      </a>

      <section style={styles.formBox}>
        <input
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          placeholder="例：暴言ワード"
          style={styles.input}
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={styles.input}
        >
          <option value="ng">NGワード</option>
          <option value="negative">ネガティブワード</option>
          <option value="spam">スパム系</option>
        </select>

        <button onClick={addWord} style={styles.addButton}>
          追加
        </button>
      </section>

      <p style={styles.count}>登録数: {words.length}件</p>

      <div style={styles.list}>
        {words.length === 0 ? (
          <p>NGワードはまだ登録されていません。</p>
        ) : (
          words.map((item) => (
            <div key={item.id} style={styles.card}>
              <div>
                <p style={styles.word}>{item.word}</p>
                <p style={styles.meta}>
                  種類: {item.type} / 登録日:{" "}
                  {new Date(item.created_at).toLocaleString("ja-JP")}
                </p>
              </div>

              <button
                onClick={() => toggleWord(item.id, item.is_active)}
                style={{
                  ...styles.toggleButton,
                  background: item.is_active ? "#16a34a" : "#64748b",
                }}
              >
                {item.is_active ? "有効" : "無効"}
              </button>
            </div>
          ))
        )}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
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
  formBox: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    background: "#1e293b",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  input: {
    padding: 10,
    borderRadius: 6,
    border: "1px solid #475569",
    minWidth: 220,
  },
  addButton: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: 6,
    cursor: "pointer",
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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  word: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
  },
  meta: {
    margin: "6px 0 0",
    fontSize: 12,
    color: "#94a3b8",
  },
  toggleButton: {
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: 6,
    cursor: "pointer",
    minWidth: 70,
  },
};