"use client";

import { useEffect, useState } from "react";

type IdentityName = {
  id: string;
  name: string;
  is_active: boolean;
};

type IdentityIcon = {
  id: string;
  icon: string;
  is_active: boolean;
};

export default function AdminIdentitiesPage() {
  const [names, setNames] = useState<IdentityName[]>([]);
  const [icons, setIcons] = useState<IdentityIcon[]>([]);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("");

  async function fetchData() {
    const res = await fetch("/api/admin/identities", {
      credentials: "include",
    });

    if (res.status === 401) {
      alert("ログインしてください");
      location.href = "/admin";
      return;
    }

    const data = await res.json();
    setNames(data.names ?? []);
    setIcons(data.icons ?? []);
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function addItem(type: "name" | "icon", value: string) {
    if (!value.trim()) return;

    await fetch("/api/admin/identities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ type, value }),
    });

    setNewName("");
    setNewIcon("");
    fetchData();
  }

  async function toggleItem(
    type: "name" | "icon",
    id: string,
    isActive: boolean
  ) {
    await fetch("/api/admin/identities", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        type,
        id,
        isActive: !isActive,
      }),
    });

    fetchData();
  }

  return (
    <main style={styles.page}>
      <h1>匿名名・アイコン管理</h1>

      <a href="/admin" style={styles.back}>
        ← ダッシュボードへ戻る
      </a>

      <section style={styles.section}>
        <h2>名前を追加</h2>

        <div style={styles.form}>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="例：夜更けの猫"
            style={styles.input}
          />
          <button onClick={() => addItem("name", newName)} style={styles.button}>
            追加
          </button>
        </div>

        <p>登録数: {names.length}件</p>

        <div style={styles.list}>
          {names.map((item) => (
            <div key={item.id} style={styles.card}>
              <span>{item.name}</span>

              <button
                onClick={() => toggleItem("name", item.id, item.is_active)}
                style={{
                  ...styles.toggleButton,
                  background: item.is_active ? "#16a34a" : "#64748b",
                }}
              >
                {item.is_active ? "使用中" : "停止中"}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.section}>
        <h2>アイコンを追加</h2>

        <div style={styles.form}>
          <input
            value={newIcon}
            onChange={(e) => setNewIcon(e.target.value)}
            placeholder="例：🌙"
            style={styles.input}
          />
          <button onClick={() => addItem("icon", newIcon)} style={styles.button}>
            追加
          </button>
        </div>

        <p>登録数: {icons.length}件</p>

        <div style={styles.iconGrid}>
          {icons.map((item) => (
            <div key={item.id} style={styles.iconCard}>
              <span style={styles.icon}>{item.icon}</span>

              <button
                onClick={() => toggleItem("icon", item.id, item.is_active)}
                style={{
                  ...styles.toggleButton,
                  background: item.is_active ? "#16a34a" : "#64748b",
                }}
              >
                {item.is_active ? "使用中" : "停止中"}
              </button>
            </div>
          ))}
        </div>
      </section>
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
  section: {
    background: "#1e293b",
    padding: 16,
    borderRadius: 10,
    marginBottom: 24,
  },
  form: {
    display: "flex",
    gap: 10,
    marginBottom: 16,
  },
  input: {
    padding: 10,
    borderRadius: 6,
    border: "1px solid #475569",
    flex: 1,
  },
  button: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: 6,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  card: {
    background: "#334155",
    padding: 10,
    borderRadius: 8,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
    gap: 8,
  },
  iconCard: {
    background: "#334155",
    padding: 10,
    borderRadius: 8,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    alignItems: "center",
  },
  icon: {
    fontSize: 28,
  },
  toggleButton: {
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer",
  },
};