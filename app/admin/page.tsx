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
  display_name: string | null;
  display_icon: string | null;
};

type AdminUser = {
  session_id: string;
  ip_hash: string | null;
  post_count: number;
  latest_post_at: string;
  display_name: string | null;
  display_icon: string | null;
};

function getTodayJapanDate() {
  return new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Tokyo",
  });
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [todayPosts, setTodayPosts] = useState<Post[]>([]);
  const [todayUsers, setTodayUsers] = useState<AdminUser[]>([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [todayUserCount, setTodayUserCount] = useState(0);

  const [message, setMessage] = useState("");

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  // -----------------------
  // ログイン
  // -----------------------
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
  setIsCheckingAuth(false);
  setTodayPosts([]);
  setTodayUsers([]);
  setPassword("");
}
  // -----------------------
  // 今日データ取得
  // -----------------------
  async function fetchTodayStats() {
    const today = getTodayJapanDate();

    const res = await fetch(`/api/admin/stats?date=${today}`, {
      credentials: "include",
    });

    if (res.status === 401) {
      setIsLoggedIn(false);
      return;
    }

    const data = await res.json();

    setTodayTotal(data.totalPosts ?? 0);
    setTodayUserCount(data.userCount ?? 0);
    setTodayPosts(data.posts ?? []);
    setTodayUsers(data.users ?? []);
  }

  useEffect(() => {
  async function checkLogin() {
    const today = getTodayJapanDate();

    const res = await fetch(`/api/admin/stats?date=${today}`, {
      credentials: "include",
    });

    if (res.status === 401) {
      setIsLoggedIn(false);
      setIsCheckingAuth(false);
      return;
    }

    const data = await res.json();

    setTodayTotal(data.totalPosts ?? 0);
    setTodayUserCount(data.userCount ?? 0);
    setTodayPosts(data.posts ?? []);
    setTodayUsers(data.users ?? []);
    setIsLoggedIn(true);
    setIsCheckingAuth(false);
  }

  checkLogin();
}, []);


if (isCheckingAuth) {
  return (
    <main style={styles.login}>
      <p>確認中...</p>
    </main>
  );
}

  // -----------------------
  // 未ログイン
  // -----------------------
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

  // -----------------------
  // UI
  // -----------------------
  return (
    <main style={styles.page}>
      <div style={styles.header}>
        <h1>管理者ダッシュボード（今日）</h1>

        <button onClick={logout} style={styles.logout}>
          ログアウト
        </button>
      </div>

      {/* ナビ */}
      <nav style={styles.nav}>
        <a href="/admin/posts">全投稿一覧</a>
        <a href="/admin/users">全ユーザー一覧</a>
        <a href="/admin/reports">通報一覧</a>
        <a href="/admin/bans">BAN一覧</a>
        <a href="/admin/review">要確認投稿</a>
      </nav>

      {/* stats */}
      <div style={styles.stats}>
        <div style={styles.statCard}>
          <p>今日の投稿数</p>
          <strong>{todayTotal}</strong>
        </div>

        <div style={styles.statCard}>
          <p>今日のユーザー数</p>
          <strong>{todayUserCount}</strong>
        </div>
      </div>

      {/* 投稿 */}
      <h2>今日の投稿</h2>

      <div style={styles.list}>
        {todayPosts.length === 0 ? (
          <p style={styles.empty}>投稿なし</p>
        ) : (
          todayPosts.map((post) => (
            <div key={post.id} style={styles.card}>
              <p>
                <strong>
                  {post.display_icon ?? "🌙"}{" "}
                  {post.display_name ?? "匿名"}
                </strong>
              </p>

              <p style={styles.text}>{post.text}</p>

              <div style={styles.meta}>
                <span>共感: {post.empathy_count ?? 0}</span>
                <span>返信: {post.reply_count ?? 0}</span>
              </div>

              <div style={styles.info}>
                <p>session: {post.session_id}</p>
                <p>ip: {post.ip_hash ?? "なし"}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ユーザー */}
      <h2>今日のユーザー</h2>

      <div style={styles.list}>
        {todayUsers.length === 0 ? (
          <p style={styles.empty}>ユーザーなし</p>
        ) : (
          todayUsers.map((user) => (
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
                <p>session: {user.session_id}</p>
                <p>ip: {user.ip_hash ?? "なし"}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}

// -----------------------
// styles
// -----------------------

const styles: any = {
  login: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#111",
    color: "#fff",
  },
  box: {
    padding: 20,
    background: "#222",
    borderRadius: 10,
  },
  input: {
    width: "100%",
    padding: 10,
    marginTop: 10,
  },
  btn: {
    marginTop: 10,
    padding: 10,
    width: "100%",
  },
  error: {
    color: "red",
  },
  page: {
    padding: 20,
    background: "#0f172a",
    minHeight: "100vh",
    color: "#fff",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  logout: {},
  nav: {
    display: "flex",
    gap: 20,
    marginBottom: 20,
  },
  stats: {
    display: "flex",
    gap: 20,
    marginBottom: 20,
  },
  statCard: {
    background: "#1e293b",
    padding: 15,
    borderRadius: 10,
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
  text: {
    marginTop: 5,
  },
  meta: {
    fontSize: 12,
    color: "#ccc",
  },
  info: {
    fontSize: 12,
    color: "#aaa",
  },
  empty: {
    color: "#aaa",
  },
};