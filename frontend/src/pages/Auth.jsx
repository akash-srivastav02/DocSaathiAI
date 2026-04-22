// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import API from "../api/axios";
// import useStore from "../store/useStore";

// export default function Auth() {
//   const [mode, setMode] = useState("login");
//   const [form, setForm] = useState({ name: "", email: "", password: "" });
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const { setUser } = useStore();
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");
//     try {
//       const endpoint = mode === "login" ? "/auth/login" : "/auth/signup";
//       const { data } = await API.post(endpoint, form);
//       setUser(data);
//       navigate("/dashboard");
//     } catch (err) {
//       setError(err.response?.data?.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ minHeight: "100vh", background: "#0a0f1e", display: "flex",
//       alignItems: "center", justifyContent: "center", fontFamily: "Segoe UI, sans-serif" }}>
//       <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 20,
//         padding: "36px 32px", width: "100%", maxWidth: 400, boxShadow: "0 25px 60px #00000066" }}>

//         <div style={{ textAlign: "center", marginBottom: 24 }}>
//           <span style={{ fontSize: 36 }}>📋</span>
//           <h1 style={{ color: "#f97316", margin: "8px 0 4px", fontSize: 26, fontWeight: 800 }}>DocSaathi</h1>
//           <p style={{ color: "#94a3b8", fontSize: 13 }}>India's Exam Document Assistant</p>
//         </div>

//         {/* Tabs */}
//         <div style={{ display: "flex", background: "#1e293b", borderRadius: 10, padding: 4, marginBottom: 20 }}>
//           {["login", "signup"].map(m => (
//             <button key={m} onClick={() => setMode(m)} style={{
//               flex: 1, padding: "8px 0", border: "none", borderRadius: 8, cursor: "pointer",
//               fontWeight: 600, fontSize: 14, transition: "all 0.2s",
//               background: mode === m ? "#f97316" : "transparent",
//               color: mode === m ? "#fff" : "#64748b"
//             }}>{m === "login" ? "Login" : "Sign Up"}</button>
//           ))}
//         </div>

//         <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
//           {mode === "signup" && (
//             <input placeholder="Full Name" value={form.name}
//               onChange={e => setForm({ ...form, name: e.target.value })} required
//               style={{ background: "#1e293b", border: "1px solid #374151", borderRadius: 10,
//                 padding: "11px 14px", color: "#f1f5f9", fontSize: 14, outline: "none" }} />
//           )}
//           <input type="email" placeholder="Email" value={form.email}
//             onChange={e => setForm({ ...form, email: e.target.value })} required
//             style={{ background: "#1e293b", border: "1px solid #374151", borderRadius: 10,
//               padding: "11px 14px", color: "#f1f5f9", fontSize: 14, outline: "none" }} />
//           <input type="password" placeholder="Password" value={form.password}
//             onChange={e => setForm({ ...form, password: e.target.value })} required
//             style={{ background: "#1e293b", border: "1px solid #374151", borderRadius: 10,
//               padding: "11px 14px", color: "#f1f5f9", fontSize: 14, outline: "none" }} />

//           {mode === "signup" && (
//             <p style={{ color: "#22c55e", fontSize: 13, textAlign: "center", margin: 0 }}>
//               🎁 Get <b>15 FREE Credits</b> on signup!
//             </p>
//           )}
//           {error && <p style={{ color: "#ef4444", fontSize: 13, textAlign: "center" }}>{error}</p>}

//           <button type="submit" disabled={loading} style={{
//             background: "linear-gradient(135deg, #f97316, #ea580c)", color: "#fff",
//             border: "none", borderRadius: 12, padding: "13px 20px",
//             fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
//             {loading ? "Please wait..." : mode === "login" ? "Login →" : "Create Free Account →"}
//           </button>
//         </form>

//         <p style={{ textAlign: "center", color: "#64748b", fontSize: 13, marginTop: 16 }}>
//           {mode === "login" ? "New user? " : "Already have account? "}
//           <span onClick={() => setMode(mode === "login" ? "signup" : "login")}
//             style={{ color: "#f97316", cursor: "pointer", fontWeight: 600 }}>
//             {mode === "login" ? "Sign Up Free" : "Login"}
//           </span>
//         </p>
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import useStore from "../store/useStore";

export default function Auth() {
  const [authMode, setAuthMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useStore();
  const navigate = useNavigate();

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
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.authRoot}>
      <div style={s.authBg} />
      <div style={s.authCard}>
        {/* Brand */}
        <div style={s.brandRow}>
          <span style={s.logo}>📋</span>
          <span style={s.brandName}>DocSaathi</span>
        </div>
        <p style={s.tagline}>India's Exam Document Assistant</p>

        {/* Tabs */}
        <div style={s.authTabs}>
          {["login", "signup"].map((m) => (
            <button
              key={m}
              onClick={() => setAuthMode(m)}
              style={{ ...s.authTab, ...(authMode === m ? s.authTabActive : {}) }}
            >
              {m === "login" ? "Login" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={s.form}>
          {authMode === "signup" && (
            <input
              style={s.input}
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          )}
          <input
            style={s.input}
            type="email"
            placeholder="Email / Mobile"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            style={s.input}
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          {authMode === "signup" && (
            <p style={s.freeCredits}>
              🎁 Get <b>15 FREE Credits</b> on signup!
            </p>
          )}
          {error && (
            <p style={{ color: "#ef4444", fontSize: 13, textAlign: "center" }}>
              {error}
            </p>
          )}
          <button type="submit" style={s.btnPrimary} disabled={loading}>
            {loading
              ? "Please wait..."
              : authMode === "login"
              ? "Login →"
              : "Create Free Account →"}
          </button>
        </form>

        {/* Divider */}
        <div style={s.authDivider}>
          <span>or continue with</span>
        </div>
        <button style={s.googleBtn}>
          <span>🇬</span> Google
        </button>

        {/* Switch */}
        <p style={s.authSwitch}>
          {authMode === "login" ? "New user? " : "Already have account? "}
          <span
            style={s.link}
            onClick={() =>
              setAuthMode(authMode === "login" ? "signup" : "login")
            }
          >
            {authMode === "login" ? "Sign Up Free" : "Login"}
          </span>
        </p>
      </div>

      {/* Stats */}
      <div style={s.authStats}>
        {[
          "2L+ Aspirants Served",
          "50+ Exams Supported",
          "₹10 per Remove Watermark",
        ].map((t) => (
          <div key={t} style={s.statPill}>
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

const s = {
  authRoot: {
    minHeight: "100vh", background: "#0a0f1e", display: "flex",
    flexDirection: "column", alignItems: "center", justifyContent: "center",
    padding: 16, fontFamily: "'Segoe UI', sans-serif",
    position: "relative", overflow: "hidden",
  },
  authBg: {
    position: "absolute", inset: 0,
    background: "radial-gradient(ellipse at 30% 20%, #f9731622 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, #3b82f622 0%, transparent 60%)",
    pointerEvents: "none",
  },
  authCard: {
    background: "#111827", border: "1px solid #1f2937", borderRadius: 20,
    padding: "36px 32px", width: "100%", maxWidth: 400, position: "relative",
    zIndex: 1, boxShadow: "0 25px 60px #00000066",
  },
  brandRow: {
    display: "flex", alignItems: "center", gap: 10,
    justifyContent: "center", marginBottom: 4,
  },
  logo: { fontSize: 28 },
  brandName: { fontSize: 24, fontWeight: 800, color: "#f97316", letterSpacing: -0.5 },
  tagline: { textAlign: "center", color: "#94a3b8", fontSize: 13, marginBottom: 24, marginTop: 4 },
  authTabs: {
    display: "flex", background: "#1e293b", borderRadius: 10,
    padding: 4, marginBottom: 20,
  },
  authTab: {
    flex: 1, padding: "8px 0", border: "none", background: "transparent",
    color: "#64748b", fontWeight: 600, borderRadius: 8, cursor: "pointer",
    fontSize: 14, transition: "all 0.2s",
  },
  authTabActive: { background: "#f97316", color: "#fff" },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  input: {
    background: "#1e293b", border: "1px solid #374151", borderRadius: 10,
    padding: "11px 14px", color: "#f1f5f9", fontSize: 14, outline: "none",
  },
  freeCredits: { color: "#22c55e", fontSize: 13, textAlign: "center", margin: 0 },
  btnPrimary: {
    background: "linear-gradient(135deg, #f97316, #ea580c)", color: "#fff",
    border: "none", borderRadius: 12, padding: "13px 20px", fontWeight: 700,
    fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center",
    justifyContent: "center", gap: 8, transition: "opacity 0.2s",
  },
  authDivider: {
    display: "flex", alignItems: "center", gap: 8,
    color: "#475569", fontSize: 12, margin: "16px 0",
  },
  googleBtn: {
    width: "100%", background: "#1e293b", border: "1px solid #374151",
    borderRadius: 10, padding: "11px 14px", color: "#f1f5f9", fontSize: 14,
    cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
    justifyContent: "center", fontWeight: 600,
  },
  authSwitch: { textAlign: "center", color: "#64748b", fontSize: 13, marginTop: 16 },
  link: { color: "#f97316", cursor: "pointer", fontWeight: 600 },
  authStats: {
    display: "flex", flexWrap: "wrap", gap: 8, marginTop: 24,
    justifyContent: "center", position: "relative", zIndex: 1,
  },
  statPill: {
    background: "#111827", border: "1px solid #1f2937", borderRadius: 20,
    padding: "6px 14px", color: "#94a3b8", fontSize: 12,
  },
};