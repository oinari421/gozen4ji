"use client";

import { useEffect, useState } from "react";

type Post = {
  id: string;
  text: string;
  session_id: string;
  ip_hash: string | null;
  created_at: string;
  is_deleted: boolean;
  reply_count: number | null;
  empathy_count: number | null;
};

type Report = {
  id: string;
  post_id: string;
  reason: string;
  status: "pending" | "resolved" | "rejected";
  created_at: string;
  posts: Post | null;
};

type Ban = {
  id: string;
  ip_hash: string;
  reason: string | null;
  created_at: string;
};

type AdminUser = {
  session_id: string;
  ip_hash: string | null;
  post_count: number;
  latest_post_at: string;
};

function getTodayJapanDate() {
  return new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Tokyo",
  });
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [posts, setPosts] = useState<Post[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [bans, setBans] = useState<Ban[]>([]);

  const [todayPosts, setTodayPosts] = useState<Post[]>([]);
  const [todayUsers, setTodayUsers] = useState<AdminUser[]>([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [todayUserCount, setTodayUserCount] = useState(0);

  const [message, setMessage] = useState("");


  console.log("入力:", password);
console.log("env:", process.env.ADMIN_PASSWORD);
  async function login() {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      setMessage("パスワードが違います");
      return;
    }

    setIsLoggedIn(true);
    setMessage("");
  }

  async function logout() {
    await fetch("/api/admin/logout", {
      method: "POST",
      credentials: "include",
    });

    setIsLoggedIn(false);
    setPosts([]);
    setReports([]);
    setBans([]);
    setTodayPosts([]);
    setTodayUsers([]);
    setPassword("");
  }

  async function fetchPosts() {
    const res = await fetch("/api/admin/posts", {
      credentials: "include",
    });

    if (res.status === 401) {
      setIsLoggedIn(false);
      return;
    }

    const data = await res.json();
    setPosts(data.posts ?? []);
  }

  async function fetchReports() {
    const res = await fetch("/api/admin/reports", {
      credentials: "include",
    });

    if (res.status === 401) {
      setIsLoggedIn(false);
      return;
    }

    const data = await res.json();
    setReports(data.reports ?? []);
  }

  async function fetchBans() {
    const res = await fetch("/api/admin/ban", {
      credentials: "include",
    });

    if (res.status === 401) {
      setIsLoggedIn(false);
      return;
    }

    const data = await res.json();
    setBans(data.bans ?? []);
  }

  async function fetchTodayStats() {
    const today = getTodayJapanDate();

    const res = await fetch(`/api/admin/stats?date=${today}`, {
      credentials: "include",
    });

    if (res.status === 401) {
      setIsLoggedIn(false);
      return;
    }

    if (!res.ok) {
      alert("今日の統計取得に失敗しました");
      return;
    }

    const data = await res.json();

    setTodayTotal(data.totalPosts ?? 0);
    setTodayUserCount(data.userCount ?? 0);
    setTodayPosts(data.posts ?? []);
    setTodayUsers(data.users ?? []);
  }

  async function deletePost(postId: string) {
    const ok = confirm("この投稿を削除しますか？");
    if (!ok) return;

    const res = await fetch("/api/admin/delete-post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ postId }),
    });

    if (!res.ok) {
      alert("削除に失敗しました");
      return;
    }

    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, is_deleted: true } : p))
    );

    setTodayPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, is_deleted: true } : p))
    );

    setReports((prev) =>
      prev.map((r) =>
        r.posts?.id === postId
          ? { ...r, posts: { ...r.posts, is_deleted: true } }
          : r
      )
    );

    fetchTodayStats();
  }

  async function updateReportStatus(
    reportId: string,
    status: "pending" | "resolved" | "rejected"
  ) {
    const res = await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ reportId, status }),
    });

    if (!res.ok) {
      alert("通報ステータスの更新に失敗しました");
      return;
    }

    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status } : r))
    );
  }

  async function banUser(ip_hash: string | null) {
    if (!ip_hash) {
      alert("ip_hashがないためBANできません");
      return;
    }

    const reason = prompt("BAN理由を入力してください");
    if (reason === null) return;

    const res = await fetch("/api/admin/ban", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ ip_hash, reason }),
    });

    if (!res.ok) {
      alert("BANに失敗しました");
      return;
    }

    fetchBans();
  }

  async function unban(id: string) {
    const ok = confirm("BANを解除しますか？");
    if (!ok) return;

    const res = await fetch("/api/admin/ban", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ id }),
    });

    if (!res.ok) {
      alert("BAN解除に失敗しました");
      return;
    }

    fetchBans();
  }

  useEffect(() => {
    if (isLoggedIn) {
      fetchPosts();
      fetchReports();
      fetchBans();
      fetchTodayStats();
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <main style={styles.login}>
        <div style={styles.box}>
          <h1>管理者ログイン</h1>

          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />

          <button onClick={login} style={styles.btn}>
            ログイン
          </button>

          {message && <p style={styles.error}>{message}</p>}
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.header}>
        <h1>管理者ページ</h1>

        <button onClick={logout} style={styles.logout}>
          ログアウト
        </button>
      </div>

      <section style={styles.section}>
        <h2>今日のダッシュボード</h2>

        <div style={styles.stats}>
          <div style={styles.statCard}>
            <p>今日の投稿数</p>
            <strong>{todayTotal}</strong>
          </div>

          <div style={styles.statCard}>
            <p>今日の投稿ユーザー数</p>
            <strong>{todayUserCount}</strong>
          </div>

          <div style={styles.statCard}>
            <p>通報数</p>
            <strong>{reports.length}</strong>
          </div>

          <div style={styles.statCard}>
            <p>BAN数</p>
            <strong>{bans.length}</strong>
          </div>
        </div>

        <h3>今日の投稿一覧</h3>

        <div style={styles.list}>
          {todayPosts.length === 0 ? (
            <p style={styles.empty}>今日の投稿はありません</p>
          ) : (
            todayPosts.map((post) => (
              <article
                key={post.id}
                style={{
                  ...styles.card,
                  opacity: post.is_deleted ? 0.45 : 1,
                }}
              >
                <div style={styles.cardHeader}>
                  <span style={styles.badge}>
                    {post.is_deleted ? "削除済み" : "表示中"}
                  </span>

                  <span style={styles.date}>
                    {new Date(post.created_at).toLocaleString("ja-JP")}
                  </span>
                </div>

                <p style={styles.text}>{post.text}</p>

                <div style={styles.meta}>
                  <span>共感: {post.empathy_count ?? 0}</span>
                  <span>返信: {post.reply_count ?? 0}</span>
                </div>

                <div style={styles.info}>
                  <p>session_id: {post.session_id}</p>
                  <p>ip_hash: {post.ip_hash ?? "なし"}</p>
                </div>

                <div style={styles.row}>
                  {!post.is_deleted && (
                    <button
                      onClick={() => deletePost(post.id)}
                      style={styles.delete}
                    >
                      削除
                    </button>
                  )}

                  <button
                    onClick={() => banUser(post.ip_hash)}
                    style={styles.gray}
                  >
                    BAN
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        <h3 style={{ marginTop: 24 }}>今日のユーザー一覧</h3>

        <div style={styles.list}>
          {todayUsers.length === 0 ? (
            <p style={styles.empty}>今日のユーザーはいません</p>
          ) : (
            todayUsers.map((user) => (
              <article key={user.session_id} style={styles.card}>
                <p>
                  <strong>投稿数:</strong> {user.post_count}
                </p>

                <p>
                  <strong>最終投稿:</strong>{" "}
                  {new Date(user.latest_post_at).toLocaleString("ja-JP")}
                </p>

                <div style={styles.info}>
                  <p>session_id: {user.session_id}</p>
                  <p>ip_hash: {user.ip_hash ?? "なし"}</p>
                </div>

                <button
                  onClick={() => banUser(user.ip_hash)}
                  style={styles.gray}
                >
                  BAN
                </button>
              </article>
            ))
          )}
        </div>
      </section>

      <section style={styles.section}>
        <h2>全投稿一覧</h2>

        <div style={styles.list}>
          {posts.map((post) => (
            <article
              key={post.id}
              style={{
                ...styles.card,
                opacity: post.is_deleted ? 0.45 : 1,
              }}
            >
              <div style={styles.cardHeader}>
                <span style={styles.badge}>
                  {post.is_deleted ? "削除済み" : "表示中"}
                </span>

                <span style={styles.date}>
                  {new Date(post.created_at).toLocaleString("ja-JP")}
                </span>
              </div>

              <p style={styles.text}>{post.text}</p>

              <div style={styles.meta}>
                <span>共感: {post.empathy_count ?? 0}</span>
                <span>返信: {post.reply_count ?? 0}</span>
              </div>

              <div style={styles.info}>
                <p>session_id: {post.session_id}</p>
                <p>ip_hash: {post.ip_hash ?? "なし"}</p>
              </div>

              <div style={styles.row}>
                {!post.is_deleted && (
                  <button
                    onClick={() => deletePost(post.id)}
                    style={styles.delete}
                  >
                    削除
                  </button>
                )}

                <button
                  onClick={() => banUser(post.ip_hash)}
                  style={styles.gray}
                >
                  BAN
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section style={styles.section}>
        <h2>通報一覧</h2>

        <div style={styles.list}>
          {reports.length === 0 ? (
            <p style={styles.empty}>通報はありません</p>
          ) : (
            reports.map((r) => (
              <article key={r.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.badge}>
                    {r.status === "pending"
                      ? "未対応"
                      : r.status === "resolved"
                      ? "対応済み"
                      : "問題なし"}
                  </span>

                  <span style={styles.date}>
                    {new Date(r.created_at).toLocaleString("ja-JP")}
                  </span>
                </div>

                <p style={styles.text}>
                  {r.posts?.text ?? "投稿が見つかりません"}
                </p>

                <div style={styles.meta}>
                  <span>理由: {r.reason}</span>
                  <span>
                    投稿状態: {r.posts?.is_deleted ? "削除済み" : "表示中"}
                  </span>
                </div>

                <div style={styles.info}>
                  <p>post_id: {r.post_id}</p>
                  <p>session_id: {r.posts?.session_id ?? "なし"}</p>
                  <p>ip_hash: {r.posts?.ip_hash ?? "なし"}</p>
                </div>

                <div style={styles.row}>
                  {r.posts && !r.posts.is_deleted && (
                    <button
                      onClick={() => deletePost(r.posts!.id)}
                      style={styles.delete}
                    >
                      投稿削除
                    </button>
                  )}

                  <button
                    onClick={() => banUser(r.posts?.ip_hash ?? null)}
                    style={styles.gray}
                  >
                    BAN
                  </button>

                  <button
                    onClick={() => updateReportStatus(r.id, "resolved")}
                    style={styles.green}
                  >
                    対応済み
                  </button>

                  <button
                    onClick={() => updateReportStatus(r.id, "rejected")}
                    style={styles.gray}
                  >
                    問題なし
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section style={styles.section}>
        <h2>BAN一覧</h2>

        <div style={styles.list}>
          {bans.length === 0 ? (
            <p style={styles.empty}>現在BAN中のIPはありません</p>
          ) : (
            bans.map((b) => (
              <article key={b.id} style={styles.card}>
                <p>
                  <strong>ip_hash:</strong> {b.ip_hash}
                </p>

                <p>
                  <strong>理由:</strong> {b.reason ?? "なし"}
                </p>

                <p>
                  <strong>BAN日時:</strong>{" "}
                  {new Date(b.created_at).toLocaleString("ja-JP")}
                </p>

                <button onClick={() => unban(b.id)} style={styles.green}>
                  BAN解除
                </button>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  login: {
    minHeight: "100vh",
    background: "#111827",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
  },
  box: {
    width: "320px",
    padding: "24px",
    background: "#1f2937",
    borderRadius: "16px",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginTop: "16px",
    borderRadius: "8px",
    border: "none",
    boxSizing: "border-box",
  },
  btn: {
    width: "100%",
    padding: "12px",
    marginTop: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#6366f1",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },
  error: {
    color: "#f87171",
    marginTop: "12px",
  },
  page: {
    minHeight: "100vh",
    background: "#0f172a",
    color: "white",
    padding: "32px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  logout: {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    background: "#334155",
    color: "white",
    cursor: "pointer",
  },
  section: {
    marginBottom: "32px",
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: "12px",
    marginBottom: "16px",
  },
  statCard: {
    background: "#1e293b",
    padding: "14px",
    borderRadius: "12px",
  },
  list: {
    display: "grid",
    gap: "12px",
  },
  card: {
    background: "#1e293b",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #334155",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "10px",
  },
  badge: {
    background: "#334155",
    padding: "4px 8px",
    borderRadius: "999px",
    fontSize: "12px",
  },
  date: {
    color: "#94a3b8",
    fontSize: "12px",
  },
  text: {
    fontSize: "16px",
    lineHeight: "1.7",
    whiteSpace: "pre-wrap",
  },
  meta: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    color: "#cbd5e1",
    fontSize: "13px",
    marginTop: "10px",
  },
  info: {
    marginTop: "10px",
    color: "#94a3b8",
    fontSize: "12px",
    wordBreak: "break-all",
  },
  row: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "12px",
  },
  delete: {
    padding: "9px 12px",
    borderRadius: "8px",
    border: "none",
    background: "#ef4444",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },
  green: {
    padding: "9px 12px",
    borderRadius: "8px",
    border: "none",
    background: "#22c55e",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },
  gray: {
    padding: "9px 12px",
    borderRadius: "8px",
    border: "none",
    background: "#64748b",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },
  empty: {
    color: "#94a3b8",
  },
};