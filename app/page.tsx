import OpenView from "@/components/OpenView";
import { isOpenNow, getNextOpenRemaining } from "@/lib/time";

export default function HomePage() {
  const open = isOpenNow();
  const remain = getNextOpenRemaining();

  if (open) {
    return <OpenView />;
  }

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <h1 style={styles.title}>午前四時に消える</h1>

        <p style={styles.text}>この場所は、夜しか開きません。</p>

        <p style={styles.subtext}>
          午前一時になると開き、午前四時にすべて消えます。
        </p>

        <p style={styles.timer}>
          次の開店まであと {remain.hours}時間{remain.minutes}分
        </p>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "radial-gradient(circle at top, #11192d 0%, #070b14 50%, #04060b 100%)",
    color: "#eef3ff",
    padding: "24px",
  },
  card: {
    width: "100%",
    maxWidth: "640px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "32px",
  },
  title: {
    fontSize: "40px",
    marginBottom: "20px",
  },
  text: {
    fontSize: "20px",
    marginBottom: "12px",
  },
  subtext: {
    color: "#9da9c7",
    lineHeight: 1.8,
  },
};