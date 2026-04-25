"use client";

import { useEffect, useState } from "react";
import { getAnonymousIdentity } from "@/lib/anonymousIdentity";

export default function TodayIdentityIntro() {
  const [show, setShow] = useState(false);
  const [identity, setIdentity] = useState<{ icon: string; name: string } | null>(
    null
  );

  useEffect(() => {
    const sessionId = localStorage.getItem("gozen4ji_session_id");

    if (!sessionId) return;

    const todayKey = new Date().toISOString().slice(0, 10);
    const storageKey = `identity_intro_seen_${todayKey}`;

    const alreadySeen = localStorage.getItem(storageKey);

    const myIdentity = getAnonymousIdentity(sessionId);
    setIdentity(myIdentity);

    if (!alreadySeen) {
      setShow(true);
    }
  }, []);

  function closeIntro() {
    const todayKey = new Date().toISOString().slice(0, 10);
    const storageKey = `identity_intro_seen_${todayKey}`;

    localStorage.setItem(storageKey, "true");
    setShow(false);
  }

  if (!show || !identity) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <p style={styles.label}>今日のあなたの名前は</p>

        <div style={styles.identity}>
          <span style={styles.icon}>{identity.icon}</span>
          <span style={styles.name}>{identity.name}</span>
        </div>

        <p style={styles.text}>
          午前四時まで、この名前で過ごします。
        </p>

        <button style={styles.button} onClick={closeIntro}>
          はじめる
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(4,6,11,0.86)",
    backdropFilter: "blur(10px)",
    padding: "24px",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "rgba(17,25,45,0.96)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "24px",
    padding: "32px",
    textAlign: "center",
    color: "#eef3ff",
    boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
  },
  label: {
    margin: 0,
    color: "#9da9c7",
    fontSize: "15px",
  },
  identity: {
    marginTop: "18px",
    marginBottom: "18px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "12px",
  },
  icon: {
    fontSize: "36px",
  },
  name: {
    fontSize: "28px",
    fontWeight: 700,
  },
  text: {
    color: "#9da9c7",
    lineHeight: 1.8,
    marginBottom: "24px",
  },
  button: {
    width: "100%",
    padding: "13px 16px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(159,194,255,0.22)",
    color: "#eef3ff",
    cursor: "pointer",
    fontSize: "16px",
  },
};