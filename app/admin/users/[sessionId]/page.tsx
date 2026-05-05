"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Post = {
  id: string;
  text: string;
  created_at: string;
  display_name: string | null;
  display_icon: string | null;
  is_deleted: boolean;
};

type Identity = {
  day_key: string;
  display_name: string;
  display_icon: string;
};

export default function UserDetailPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [posts, setPosts] = useState<Post[]>([]);
  const [identities, setIdentities] = useState<Identity[]>([]);

  async function fetchData() {
    const res = await fetch(
      `/api/admin/user-detail?sessionId=${sessionId}`,
      {
        credentials: "include",
      }
    );

    if (res.status === 401) {
      alert("ログインしてください");
      location.href = "/admin";
      return;
    }

    const data = await res.json();

    setPosts(data.posts ?? []);
    setIdentities(data.identities ?? []);
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <main style={styles.page}>
      <h1>ユーザー詳細</h1>

      <a href="/admin/users">← 戻る</a>

      <p style={{ marginTop: 10 }}>
        <strong>session_id:</strong> {sessionId}
      </p>

      {/* 日ごとの名前 */}
     <h2>日別の匿名名</h2>

<div style={styles.list}>
  {identities.length === 0 ? (
    <p>日別の匿名名はありません</p>
  ) : (
    identities.map((identity) => (
      <div key={identity.day_key} style={styles.card}>
        <p>{identity.day_key}</p>
        <p>
          {identity.display_icon} {identity.display_name}
        </p>
      </div>
    ))
  )}
</div>

      {/* 投稿一覧 */}
      <h2 style={{ marginTop: 30 }}>投稿一覧</h2>

      <div style={styles.list}>
        {posts.map((post) => (
          <div key={post.id} style={styles.card}>
            <p>
              {post.display_icon} {post.display_name}
            </p>

            <p>{post.text}</p>

            <p style={styles.date}>
              {new Date(post.created_at).toLocaleString("ja-JP")}
            </p>

            {post.is_deleted && (
              <p style={{ color: "red" }}>削除済み</p>
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
  date: {
    fontSize: 12,
    color: "#aaa",
  },
};