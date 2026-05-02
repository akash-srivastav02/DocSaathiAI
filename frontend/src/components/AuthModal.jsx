import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import API from "../api/axios";
import useStore from "../store/useStore";

export default function AuthModal({ onClose, onSuccess, title = "Login Required", subtitle = "Login or sign up to unlock your final download." }) {
  const { setUser } = useStore();
  const [authMode, setAuthMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const finishAuth = (data) => {
    setUser(data);
    onSuccess?.(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = authMode === "login" ? "/auth/login" : "/auth/signup";
      const { data } = await API.post(endpoint, form);
      finishAuth(data);
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");

    try {
      const { data } = await API.post("/auth/google", {
        credential: credentialResponse.credential,
      });
      finishAuth(data);
    } catch (err) {
      setError(err.response?.data?.message || "Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} style={s.closeBtn}>x</button>
        <p style={s.eyebrow}>One quick step</p>
        <h3 style={s.title}>{title}</h3>
        <p style={s.subtitle}>{subtitle}</p>

        <div style={s.tabs}>
          {["login", "signup"].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                setAuthMode(mode);
                setError("");
              }}
              style={{
                ...s.tab,
                ...(authMode === mode ? s.tabActive : null),
              }}
            >
              {mode === "login" ? "Login" : "Sign Up"}
            </button>
          ))}
        </div>

        <div style={s.googleWrap}>
          <div style={s.googleClip}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google login was cancelled or failed.")}
              useOneTap={false}
              theme="filled_black"
              size="large"
              type="icon"
              shape="circle"
            />
          </div>
        </div>

        <div style={s.divider}>
          <div style={s.dividerLine} />
          <span style={s.dividerText}>or continue with email</span>
          <div style={s.dividerLine} />
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          {authMode === "signup" && (
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={s.input}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={s.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={s.input}
            required
          />

          {error && <div style={s.error}>{error}</div>}

          <button type="submit" style={s.submitBtn} disabled={loading}>
            {loading ? "Please wait..." : authMode === "login" ? "Login to Continue" : "Create Account & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(2, 6, 23, 0.72)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 1200,
  },
  modal: {
    width: "100%",
    maxWidth: 420,
    background: "#0d1421",
    border: "1px solid #1e293b",
    borderRadius: 20,
    padding: "24px 22px",
    position: "relative",
    boxShadow: "0 24px 70px rgba(0,0,0,0.45)",
  },
  closeBtn: {
    position: "absolute",
    right: 12,
    top: 12,
    border: "none",
    background: "transparent",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: 18,
    width: 32,
    height: 32,
  },
  eyebrow: {
    color: "#f97316",
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1,
    margin: 0,
  },
  title: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: 800,
    margin: "8px 0 6px",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 1.6,
    margin: "0 0 18px",
  },
  tabs: {
    display: "flex",
    gap: 8,
    background: "#111827",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    border: "none",
    borderRadius: 10,
    padding: "10px 0",
    background: "transparent",
    color: "#64748b",
    fontWeight: 700,
    cursor: "pointer",
  },
  tabActive: {
    background: "#f97316",
    color: "#fff",
  },
  googleWrap: {
    display: "flex",
    justifyContent: "center",
    margin: "0 auto 14px",
  },
  googleClip: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.24)",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: "#1e293b",
  },
  dividerText: {
    color: "#64748b",
    fontSize: 12,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  input: {
    background: "#111827",
    border: "1px solid #374151",
    borderRadius: 10,
    padding: "12px 14px",
    color: "#f8fafc",
    fontSize: 14,
    outline: "none",
  },
  error: {
    background: "#450a0a30",
    border: "1px solid #7f1d1d",
    borderRadius: 10,
    padding: "10px 12px",
    color: "#fca5a5",
    fontSize: 13,
  },
  submitBtn: {
    background: "linear-gradient(135deg,#f97316,#ea580c)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "13px 18px",
    fontWeight: 800,
    fontSize: 14,
    cursor: "pointer",
  },
};
