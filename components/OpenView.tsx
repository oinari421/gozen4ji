"use client";

import { useEffect, useState } from "react";
import PostForm from "./PostForm";
import LatestPost from "./LatestPost";
import MyPostsView from "./MyPostsView";
import TodayIdentityIntro from "./TodayIdentityIntro";
import NightHeader from "./NightHeader";

export default function OpenView() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [tab, setTab] = useState<"everyone" | "mine">("everyone");
  const [notificationCount, setNotificationCount] = useState(0);

  async function fetchNotificationCount() {
    const sessionId = localStorage.getItem("gozen4ji_session_id");

    if (!sessionId) return;

    const res = await fetch("/api/my-notification-count", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionId }),
    });

    const data = await res.json();
    setNotificationCount(data.count || 0);
  }

  useEffect(() => {
    fetchNotificationCount();

    const timer = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main style={styles.main}>
      <TodayIdentityIntro />

      <div style={styles.wrap}>
        <NightHeader />

        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tabButton,
              ...(tab === "everyone" ? styles.activeTab : {}),
            }}
            onClick={() => setTab("everyone")}
          >
            みんな
          </button>

          <button
            style={{
              ...styles.tabButton,
              ...(tab === "mine" ? styles.activeTab : {}),
            }}
            onClick={() => {
              setTab("mine");
              fetchNotificationCount();
            }}
          >
            自分{notificationCount > 0 ? ` ${notificationCount}` : ""}
          </button>
        </div>

       {tab === "everyone" ? (
  <>
    <PostForm
      onPosted={() => {
        setRefreshKey((v) => v + 1);
        fetchNotificationCount();
      }}
    />
    <LatestPost key={refreshKey} />
  </>
) : (
  <MyPostsView key={`${refreshKey}-${tab}`} />
)}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    background:
      "radial-gradient(circle at top, #11192d 0%, #070b14 50%, #04060b 100%)",
    color: "#eef3ff",
    padding: "24px",
  },
  wrap: {
    width: "100%",
    maxWidth: "640px",
    display: "grid",
    gap: "16px",
  },
  tabs: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
  },
  tabButton: {
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    color: "#9da9c7",
    cursor: "pointer",
    fontSize: "15px",
  },
  activeTab: {
    background: "rgba(159,194,255,0.18)",
    color: "#eef3ff",
    border: "1px solid rgba(159,194,255,0.28)",
  },
};