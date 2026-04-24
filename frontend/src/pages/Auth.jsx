import { memo, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import API from "../api/axios";
import useStore from "../store/useStore";
import useIsMobile from "../hooks/useIsMobile";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const GoogleAuthCard = memo(function GoogleAuthCard({ authMode, onSuccess, onError, buttonWidth, isMobile }) {
  return (
    <div style={s.googleCard}>
      <div style={s.googleCardHeader}>
        <div>
          <p style={s.googleTitle}>Continue with Google</p>
          <p style={s.googleSub}>Fast, secure sign in for your exam document workspace.</p>
        </div>
        <div style={s.googleBadge}>Quick Access</div>
      </div>
      <div style={{ ...s.googleButtonShell, ...(isMobile ? s.googleButtonShellMobile : null) }}>
        <div style={{ ...s.googleWrap, width: buttonWidth }}>
          <GoogleLogin
            onSuccess={onSuccess}
            onError={onError}
            useOneTap={false}
            theme="outline"
            size="large"
            width={buttonWidth}
            text={authMode === "login" ? "signin_with" : "signup_with"}
            shape="pill"
            logo_alignment="left"
          />
        </div>
      </div>
    </div>
  );
});

export default function Auth() {
  const isMobile = useIsMobile(520);
  const [authMode, setAuthMode] = useState("login");
  const [form, setForm]         = useState({ name: "", email: "", password: "" });
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const { setUser }             = useStore();
  const navigate                = useNavigate();
  const googleButtonWidth       = isMobile ? 294 : 340;

  // ── Email/Password submit ─────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const endpoint = authMode === "login" ? "/auth/login" : "/auth/signup";
      const { data } = await API.post(endpoint, form);
      setUser(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Google OAuth success ──────────────────────────────────────────────────
  const handleGoogleSuccess = useCallback(async (credentialResponse) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await API.post("/auth/google", {
        credential: credentialResponse.credential,
      });
      setUser(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Google login failed. Try again.");
    } finally {
      setLoading(false);
    }
  }, [navigate, setUser]);

  const handleGoogleError = useCallback(() => {
    setError("Google login was cancelled or failed. Please try again.");
  }, []);

  const field = (key, type, placeholder) => (
    <input
      type={type}
      placeholder={placeholder}
      value={form[key]}
      onChange={e => setForm({ ...form, [key]: e.target.value })}
      required={key !== "name" || authMode === "signup"}
      style={s.input}
    />
  );

  return (
    <div style={s.root}>
      <div style={s.glow1} /> <div style={s.glow2} />

      <div style={s.card}>
        {/* Brand */}
        <div style={s.brand}>
          <span style={s.brandIconWrap}>
            <img src="/favicon.png" alt="Doc Saathi AI logo" style={s.brandIcon} />
          </span>
          <div>
            <span style={s.brandName}>Doc Saathi </span>
            <span style={s.brandAI}>AI</span>
          </div>
        </div>
        <p style={s.tagline}>India's Exam Document Assistant</p>

        {/* Tabs */}
        <div style={s.tabs}>
          {["login","signup"].map(m => (
            <button key={m} onClick={() => { setAuthMode(m); setError(""); }}
              style={{ ...s.tab, ...(authMode === m ? s.tabActive : {}) }}>
              {m === "login" ? "Login" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Google button — full width, prominent */}
        {googleClientId ? (
          <GoogleAuthCard
            authMode={authMode}
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            buttonWidth={googleButtonWidth}
            isMobile={isMobile}
          />
        ) : (
          <div style={s.googleNotice}>
            Google login is unavailable until <code>VITE_GOOGLE_CLIENT_ID</code> is added to your frontend <code>.env</code>.
          </div>
        )}

        {/* Divider */}
        <div style={s.divider}>
          <div style={s.dividerLine} />
          <span style={s.dividerText}>or use email</span>
          <div style={s.dividerLine} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={s.form}>
          {authMode === "signup" && field("name", "text", "Full Name")}
          {field("email",    "email",    "Email address")}
          {field("password", "password", "Password")}

          {authMode === "signup" && (
            <div style={s.freeBadge}>
              🎁 You'll get <b>15 FREE credits</b> on signup!
            </div>
          )}

          {error && <div style={s.errorBox}>{error}</div>}

          <button type="submit" style={s.submitBtn} disabled={loading}>
            {loading
              ? "Please wait..."
              : authMode === "login" ? "Login →" : "Create Free Account →"}
          </button>
        </form>

        {/* Switch mode */}
        <p style={s.switchText}>
          {authMode === "login" ? "New user? " : "Already have account? "}
          <span style={s.switchLink}
            onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setError(""); }}>
            {authMode === "login" ? "Sign Up Free" : "Login"}
          </span>
        </p>
      </div>

      {/* Stats row */}
      <div style={s.stats}>
        {["50+ Exams Supported", "15 Free Credits on Signup", "₹9 Single Fix Plan"].map(t => (
          <div key={t} style={s.statPill}>{t}</div>
        ))}
      </div>
    </div>
  );
}

const s = {
  root: { minHeight: "100vh", background: "#070c18", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "'Segoe UI', sans-serif", position: "relative", overflow: "hidden" },
  glow1: { position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "#f9731614", filter: "blur(80px)", top: "-10%", left: "-10%", pointerEvents: "none" },
  glow2: { position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "#3b82f610", filter: "blur(80px)", bottom: "-10%", right: "-10%", pointerEvents: "none" },

  card: { background: "#0d1421", border: "1px solid #1e293b", borderRadius: 20, padding: "32px 28px", width: "100%", maxWidth: 400, position: "relative", zIndex: 1, boxShadow: "0 20px 60px #00000060", boxSizing: "border-box" },

  brand: { display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 4 },
  brandIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: "#f9731620",
    border: "1px solid #f9731638",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },
  brandIcon: { width: 24, height: 24, objectFit: "contain", display: "block" },
  brandName: { fontSize: 22, fontWeight: 800, color: "#f1f5f9" },
  brandAI:   { fontSize: 22, fontWeight: 800, color: "#f97316" },
  tagline: { textAlign: "center", color: "#64748b", fontSize: 13, margin: "0 0 22px" },

  tabs: { display: "flex", background: "#111827", borderRadius: 10, padding: 4, marginBottom: 20 },
  tab: { flex: 1, padding: "8px 0", border: "none", background: "transparent", color: "#64748b", fontWeight: 600, borderRadius: 8, cursor: "pointer", fontSize: 14, transition: "all 0.2s" },
  tabActive: { background: "#f97316", color: "#fff" },

  googleCard: {
    width: "100%",
    marginBottom: 16,
    borderRadius: 13,
    border: "1px solid #263246",
    background: "linear-gradient(180deg, #111827, #0f172a)",
    padding: "11px 11px 12px",
    boxSizing: "border-box",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
  },
  googleCardHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 },
  googleTitle: { color: "#f8fafc", fontWeight: 700, fontSize: 14, margin: 0 },
  googleSub: { color: "#94a3b8", fontSize: 11, lineHeight: 1.45, margin: "3px 0 0" },
  googleBadge: {
    background: "#f9731618",
    color: "#fdba74",
    border: "1px solid #f9731635",
    borderRadius: 999,
    padding: "5px 9px",
    fontSize: 11,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  googleButtonShell: {
    borderRadius: 999,
    overflow: "hidden",
    background: "#ffffff",
    padding: 2,
    boxShadow: "inset 0 0 0 1px rgba(148,163,184,0.12)",
    display: "flex",
    justifyContent: "center",
  },
  googleButtonShellMobile: { padding: 2 },
  googleWrap: { display: "flex", justifyContent: "center", minHeight: 42, maxWidth: "100%" },
  googleNotice: { width: "100%", marginBottom: 16, border: "1px solid #374151", borderRadius: 10, padding: "12px 14px", color: "#94a3b8", background: "#111827", fontSize: 13, textAlign: "center", boxSizing: "border-box" },

  divider: { display: "flex", alignItems: "center", gap: 10, margin: "0 0 16px" },
  dividerLine: { flex: 1, height: 1, background: "#1e293b" },
  dividerText: { color: "#475569", fontSize: 12, whiteSpace: "nowrap" },

  form: { display: "flex", flexDirection: "column", gap: 12 },
  input: { background: "#111827", border: "1px solid #374151", borderRadius: 10, padding: "11px 14px", color: "#f1f5f9", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" },

  freeBadge: { background: "#052e1620", border: "1px solid #14532d", borderRadius: 8, padding: "8px 12px", color: "#86efac", fontSize: 13, textAlign: "center" },
  errorBox:  { background: "#450a0a30", border: "1px solid #7f1d1d", borderRadius: 8, padding: "10px 14px", color: "#fca5a5", fontSize: 13 },

  submitBtn: { background: "linear-gradient(135deg,#f97316,#ea580c)", color: "#fff", border: "none", borderRadius: 11, padding: "13px 20px", fontWeight: 700, fontSize: 15, cursor: "pointer", transition: "opacity 0.2s" },

  switchText: { textAlign: "center", color: "#64748b", fontSize: 13, marginTop: 16 },
  switchLink: { color: "#f97316", cursor: "pointer", fontWeight: 700 },

  stats: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20, justifyContent: "center", position: "relative", zIndex: 1 },
  statPill: { background: "#0d1421", border: "1px solid #1e293b", borderRadius: 20, padding: "6px 14px", color: "#64748b", fontSize: 12 },
};
