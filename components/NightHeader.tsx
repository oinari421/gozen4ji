"use client";

import { useEffect, useState } from "react";

type Identity = {
  icon: string;
  name: string;
};

function getSessionId() {
  const key = "gozen4ji_session_id";
  let value = localStorage.getItem(key);

  if (!value) {
    value = crypto.randomUUID();
    localStorage.setItem(key, value);
  }

  return value;
}

function getRemainingUntilFour() {
  const now = new Date();
  const target = new Date(now);

  target.setHours(4, 0, 0, 0);

  if (now.getHours() >= 4) {
    target.setDate(target.getDate() + 1);
  }

  const diff = Math.max(0, target.getTime() - now.getTime());

  const hours = Math.floor(diff / 1000 / 60 / 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);

  return {
    text: `${hours}時間${minutes}分`,
    hours,
    minutes,
  };
}

export default function NightHeader() {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [activeCount, setActiveCount] = useState(0);
  const [remaining, setRemaining] = useState("");
  const [remainingHours, setRemainingHours] = useState(0);
  const [theme, setTheme] = useState("");

  async function fetchIdentity() {
    try {
      const sessionId = getSessionId();

      const res = await fetch("/api/identity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json();

      setIdentity({
        name: data.name,
        icon: data.icon,
      });
    } catch (error) {
      console.error("identity fetch error:", error);
    }
  }

  async function updateActiveCount() {
    try {
      const sessionId = getSessionId();

      const res = await fetch("/api/active", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json();
      setActiveCount(data.count || 0);
    } catch (error) {
      console.error("active count error:", error);
    }
  }

  async function fetchTheme() {
    try {
      const res = await fetch("/api/theme", {
        cache: "no-store",
      });

      const data = await res.json();
      setTheme(data.theme ?? "");
    } catch (error) {
      console.error("theme fetch error:", error);
      setTheme("");
    }
  }

  function updateRemaining() {
    const result = getRemainingUntilFour();
    setRemaining(result.text);
    setRemainingHours(result.hours);
  }

  useEffect(() => {
    fetchIdentity();
    fetchTheme();
    updateRemaining();
    updateActiveCount();

    const timer = setInterval(() => {
      updateRemaining();
      updateActiveCount();
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div style={styles.card}>
      <h1 style={styles.title}>午前四時に消える</h1>

      {identity && (
        <div style={styles.identity}>
          <span style={styles.icon}>{identity.icon}</span>
          <span style={styles.name}>{identity.name}</span>
        </div>
      )}

      <div style={styles.meta}>
        <span>今夜起きている人 {activeCount}人</span>
        <span>消えるまであと {remaining}</span>
      </div>

      {remainingHours === 0 && (
        <div style={styles.lastNotice}>
          もうすぐ朝です。この夜は、まもなく消えます。
        </div>
      )}

      {theme && (
        <div style={styles.themeBox}>
          <div style={styles.themeLabel}>今夜の問い</div>
          <div style={styles.themeText}>{theme}</div>
        </div>
      )}

      <p style={styles.subtext}>
        午前四時になると、ここにある言葉はすべて消えます。
      </p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "28px",
  },
  title: {
    fontSize: "36px",
    margin: "0 0 18px",
  },
  identity: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "14px",
    color: "#eef3ff",
  },
  icon: {
    fontSize: "28px",
  },
  name: {
    fontSize: "22px",
    fontWeight: 700,
  },
  meta: {
    display: "grid",
    gap: "6px",
    color: "#c9d6ff",
    fontSize: "14px",
    marginBottom: "14px",
  },
  lastNotice: {
    marginTop: "12px",
    marginBottom: "12px",
    padding: "12px",
    borderRadius: "12px",
    background: "rgba(255,180,120,0.1)",
    border: "1px solid rgba(255,180,120,0.18)",
    color: "#ffd6b0",
    fontSize: "14px",
  },
  themeBox: {
    marginTop: "14px",
    marginBottom: "14px",
    padding: "14px",
    borderRadius: "14px",
    background: "rgba(159,194,255,0.08)",
    border: "1px solid rgba(159,194,255,0.12)",
  },
  themeLabel: {
    fontSize: "12px",
    color: "#9da9c7",
    marginBottom: "6px",
  },
  themeText: {
    color: "#eef3ff",
    fontSize: "16px",
    lineHeight: 1.7,
  },
  subtext: {
    color: "#9da9c7",
    lineHeight: 1.8,
    margin: 0,
  },
};