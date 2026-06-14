import { useNavigate } from "react-router-dom";
import PublicTopBar from "../components/PublicTopBar";
import useIsMobile from "../hooks/useIsMobile";
import { BROWSER_ONLY_COPY } from "../utils/browserOnlyMode";

export default function BrowserOnlyPausedPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile(820);

  return (
    <div style={s.root}>
      <PublicTopBar />
      <main style={{ ...s.content, ...(isMobile ? s.contentMobile : null) }}>
        <div style={s.card}>
          <span style={s.badge}>{BROWSER_ONLY_COPY.short}</span>
          <h1 style={s.title}>{BROWSER_ONLY_COPY.pausedTitle}</h1>
          <p style={s.text}>{BROWSER_ONLY_COPY.pausedText}</p>
          <div style={s.actions}>
            <button type="button" style={s.primaryBtn} onClick={() => navigate("/all-tools")}>
              Open Live Tools
            </button>
            <button type="button" style={s.secondaryBtn} onClick={() => navigate("/support")}>
              View Support
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

const s = {
  root: { minHeight: "100vh", background: "transparent", fontFamily: "'Segoe UI', sans-serif" },
  content: {
    maxWidth: 980,
    margin: "0 auto",
    padding: "132px 24px 56px",
  },
  contentMobile: {
    padding: "156px 14px 44px",
  },
  card: {
    borderRadius: 28,
    border: "1px solid var(--ff-border)",
    background: "var(--ff-panel-solid)",
    padding: "32px 28px",
    boxShadow: "0 28px 64px rgba(8, 15, 32, 0.18)",
    display: "grid",
    gap: 14,
  },
  badge: {
    width: "fit-content",
    borderRadius: 999,
    padding: "7px 12px",
    background: "color-mix(in srgb, var(--ff-orange) 12%, transparent)",
    color: "var(--ff-orange)",
    border: "1px solid color-mix(in srgb, var(--ff-orange) 24%, transparent)",
    fontSize: 12,
    fontWeight: 800,
  },
  title: { margin: 0, color: "var(--ff-text)", fontSize: 36, lineHeight: 1.08, fontWeight: 900, letterSpacing: -0.8 },
  text: { margin: 0, color: "var(--ff-text-soft)", fontSize: 16, lineHeight: 1.8, maxWidth: 700 },
  actions: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 },
  primaryBtn: {
    border: "none",
    borderRadius: 999,
    padding: "12px 18px",
    background: "linear-gradient(135deg,#f97316,#ea580c)",
    color: "#fff",
    fontWeight: 800,
    fontSize: 14,
    cursor: "pointer",
  },
  secondaryBtn: {
    borderRadius: 999,
    border: "1px solid var(--ff-border)",
    padding: "12px 18px",
    background: "var(--ff-panel)",
    color: "var(--ff-text)",
    fontWeight: 800,
    fontSize: 14,
    cursor: "pointer",
  },
};
