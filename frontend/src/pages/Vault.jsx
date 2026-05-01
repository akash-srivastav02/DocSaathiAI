import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

const TOOL_LABELS = {
  photo: "Exam Photo",
  sign: "Exam Signature",
  signature: "Exam Signature",
  merger: "Photo+Sign/Date",
  crop: "Crop & Resize",
  imgcompress: "Image Compressor",
  pdfcompress: "PDF Compressor",
  pdfeditor: "PDF Editor",
  resume: "Resume Builder",
};

export default function Vault() {
  const navigate = useNavigate();
  const { user, credits, logout } = useStore();
  const currentCredits = credits ?? user?.credits ?? 0;
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const vaultKey = `vault_${user?._id || "guest"}`;
    const stored = JSON.parse(localStorage.getItem(vaultKey) || "[]");
    setItems(stored);
  }, [user]);

  const handleDelete = (id) => {
    setDeleting(id);
    setTimeout(() => {
      const vaultKey = `vault_${user?._id || "guest"}`;
      const updated = items.filter(item => item.id !== id);
      localStorage.setItem(vaultKey, JSON.stringify(updated));
      setItems(updated);
      setDeleting(null);
    }, 300);
  };

  const handleDownload = (item) => {
    const a = document.createElement("a");
    a.href = item.url;
    a.download = `formfixer_${item.toolType}_${item.examName || "file"}.jpg`;
    a.click();
  };

  const filtered = filter === "all" ? items : items.filter(i => i.toolType === filter);

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div style={s.root}>
      <Sidebar
        credits={currentCredits}
        activeNav="Vault"
        onLogout={() => { logout(); navigate("/"); }}
      />
      <div style={s.main}>
        <TopBar user={user} credits={currentCredits} onLogout={() => { logout(); navigate("/"); }} />

        <div style={s.header}>
          <h2 style={s.title}>🗄️ Your Vault</h2>
          <p style={s.subtitle}>All your processed files in one place</p>
        </div>

        {/* Filters */}
        <div style={s.filters}>
          {["all", "photo", "signature", "merger"].map(f => (
            <button
              key={f}
              style={{ ...s.filterBtn, ...(filter === f ? s.filterActive : {}) }}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : TOOL_LABELS[f] || f}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={s.empty}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📂</div>
            <p style={{ color: "#64748b", marginBottom: 16 }}>No files in your vault yet.</p>
            <button style={s.emptyBtn} onClick={() => navigate("/dashboard")}>
              Go to Dashboard →
            </button>
          </div>
        )}

        {/* Grid */}
        <div style={s.grid}>
          {filtered.map(item => (
            <div key={item.id} style={{ ...s.card, opacity: deleting === item.id ? 0 : 1 }}>
              <div style={s.cardImgWrap}>
                <img src={item.url} alt={item.examName} style={s.cardImg} />
              </div>
              <div style={s.cardBody}>
                <div style={s.cardMeta}>
                  <span style={s.cardTool}>{TOOL_LABELS[item.toolType] || item.toolType}</span>
                  {item.examName && <span style={s.cardExam}>{item.examName}</span>}
                </div>
                <div style={s.cardInfo}>
                  <span style={s.cardSize}>{item.sizeKB} KB</span>
                  <span style={s.cardDate}>{formatDate(item.date)}</span>
                </div>
                <div style={s.cardActions}>
                  <button style={s.dlBtn} onClick={() => handleDownload(item)}>📥 Download</button>
                  <button style={s.delBtn} onClick={() => handleDelete(item.id)}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length > 0 && (
          <p style={s.note}>
            💾 Files are stored locally in your browser. Download important files to keep them safe.
          </p>
        )}
      </div>
    </div>
  );
}

const s = {
  root: { display: "flex", minHeight: "100vh", background: "transparent", fontFamily: "'Segoe UI', sans-serif" },
  main: { flex: 1, overflowY: "auto", paddingBottom: 40 },
  header: { padding: "24px 28px 12px" },
  title: { color: "#f1f5f9", fontWeight: 800, fontSize: 18, margin: 0 },
  subtitle: { color: "#64748b", fontSize: 13, marginTop: 4 },
  filters: { display: "flex", gap: 8, padding: "0 28px 16px", flexWrap: "wrap" },
  filterBtn: { background: "#1e293b", border: "none", color: "#94a3b8", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" },
  filterActive: { background: "#f97316", color: "#fff" },
  empty: { textAlign: "center", padding: "60px 20px" },
  emptyBtn: { background: "#f97316", border: "none", color: "#fff", borderRadius: 8, padding: "10px 20px", fontWeight: 700, cursor: "pointer" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, padding: "0 28px" },
  card: { background: "#0d1421", border: "1px solid #1e293b", borderRadius: 12, overflow: "hidden", transition: "all 0.2s" },
  cardImgWrap: { height: 140, background: "#111827", display: "flex", alignItems: "center", justifyContent: "center" },
  cardImg: { maxWidth: "100%", maxHeight: "100%", objectFit: "contain" },
  cardBody: { padding: 12 },
  cardMeta: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" },
  cardTool: { background: "#f9731620", color: "#f97316", fontSize: 10, fontWeight: 700, borderRadius: 4, padding: "2px 6px" },
  cardExam: { color: "#94a3b8", fontSize: 11, fontWeight: 600 },
  cardInfo: { display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 11, color: "#64748b" },
  cardActions: { display: "flex", gap: 8 },
  dlBtn: { flex: 1, background: "#1e293b", border: "none", color: "#f1f5f9", borderRadius: 6, padding: "6px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" },
  delBtn: { background: "#1e293b", border: "none", color: "#ef4444", borderRadius: 6, padding: "6px 10px", fontSize: 11, cursor: "pointer" },
  note: { padding: "16px 28px", color: "#64748b", fontSize: 12 },
};
