import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import useStore from "../store/useStore";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import useIsMobile from "../hooks/useIsMobile";

const STATUS_OPTIONS = ["Interested", "Applying", "Applied", "Admit Card", "Exam Done", "Result Awaited"];

const COMING_SOON = [
  {
    title: "Auto Vacancy Feed",
    desc: "Daily government and entrance updates, auto-grouped by exam family and qualification.",
    accent: "#f97316",
  },
  {
    title: "Qualification-Based Matching",
    desc: "Show only the forms that match class level, graduation, stream, and age.",
    accent: "#22c55e",
  },
  {
    title: "AI Study Assistant",
    desc: "Exam summary, syllabus breakdown, and next-step guidance in one workspace.",
    accent: "#8b5cf6",
  },
];

const emptyForm = {
  title: "",
  organization: "",
  category: "Government Exam",
  status: "Interested",
  deadline: "",
  officialLink: "",
  notes: "",
};

const sortApplications = (items) =>
  [...items].sort((a, b) => {
    const da = a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER;
    const db = b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER;
    return da - db;
  });

function formatDate(date) {
  if (!date) return "No deadline";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function daysLeft(deadline) {
  if (!deadline) return null;
  const today = new Date();
  const end = new Date(deadline);
  const diff = Math.ceil((end.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0)) / 86400000);
  return diff;
}

export default function Vault() {
  const navigate = useNavigate();
  const { user, credits, logout } = useStore();
  const isMobile = useIsMobile(900);
  const currentCredits = credits ?? user?.credits ?? 0;
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [trackerMode, setTrackerMode] = useState("cloud");
  const storageKey = useMemo(
    () => `formfixer_tracker_${user?._id || user?.email || "guest"}`,
    [user?._id, user?.email]
  );

  const readLocalApplications = () => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? sortApplications(parsed) : [];
    } catch {
      return [];
    }
  };

  const writeLocalApplications = (items) => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(sortApplications(items)));
    } catch {
      // ignore storage write failures
    }
  };

  useEffect(() => {
    let active = true;
    const loadTracker = async () => {
        try {
          setLoading(true);
          const { data } = await API.get("/tracker");
          if (active) {
            const next = sortApplications(data.applications || []);
            setApplications(next);
            setTrackerMode("cloud");
            writeLocalApplications(next);
          }
        } catch (err) {
          if (active) {
            const localItems = readLocalApplications();
            setApplications(localItems);
            setTrackerMode("local");
            if (localItems.length) {
              setMessage("Tracker is currently using local device storage.");
            } else {
              setError(err.response?.data?.message || "Could not load tracker right now.");
            }
          }
        } finally {
          if (active) setLoading(false);
        }
    };
    loadTracker();
    return () => {
      active = false;
    };
  }, []);

  const counts = useMemo(() => {
    const now = {
      total: applications.length,
      applied: applications.filter((item) => item.status === "Applied").length,
      urgent: applications.filter((item) => {
        const left = daysLeft(item.deadline);
        return left !== null && left >= 0 && left <= 7;
      }).length,
    };
    return now;
  }, [applications]);

  const filteredApplications = useMemo(() => {
    if (filter === "All") return applications;
    return applications.filter((item) => item.status === filter);
  }, [applications, filter]);

  const upcoming = useMemo(
    () =>
      [...applications]
        .filter((item) => item.deadline)
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 3),
    [applications]
  );

  const resetNotice = () => {
    setError("");
    setMessage("");
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    resetNotice();
    if (!form.title.trim() || !form.organization.trim()) {
      setError("Exam/Post name and organization are required.");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        ...form,
        deadline: form.deadline || null,
      };
      if (trackerMode === "local") {
        const localItem = {
          ...payload,
          _id: `local-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setApplications((prev) => {
          const next = sortApplications([localItem, ...prev]);
          writeLocalApplications(next);
          return next;
        });
      } else {
        const { data } = await API.post("/tracker", payload);
        setApplications((prev) => {
          const next = sortApplications([data.application, ...prev]);
          writeLocalApplications(next);
          return next;
        });
      }
      setForm(emptyForm);
      setMessage(trackerMode === "local" ? "Application saved on this device." : "Application saved to your tracker.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save this application.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (item, status) => {
    try {
      setUpdatingId(item._id);
      if (trackerMode === "local" || String(item._id).startsWith("local-")) {
        setApplications((prev) => {
          const next = prev.map((entry) =>
            entry._id === item._id ? { ...entry, status, updatedAt: new Date().toISOString() } : entry
          );
          writeLocalApplications(next);
          return next;
        });
      } else {
        const { data } = await API.put(`/tracker/${item._id}`, { status });
        setApplications((prev) => {
          const next = prev.map((entry) => (entry._id === item._id ? data.application : entry));
          writeLocalApplications(next);
          return next;
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (itemId) => {
    try {
      setDeletingId(itemId);
      if (trackerMode === "local" || String(itemId).startsWith("local-")) {
        setApplications((prev) => {
          const next = prev.filter((item) => item._id !== itemId);
          writeLocalApplications(next);
          return next;
        });
      } else {
        await API.delete(`/tracker/${itemId}`);
        setApplications((prev) => {
          const next = prev.filter((item) => item._id !== itemId);
          writeLocalApplications(next);
          return next;
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not remove this item.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={s.root}>
      <Sidebar credits={currentCredits} activeNav="Tracker" onLogout={() => { logout(); navigate("/"); }} />
      <div style={s.main}>
        <TopBar user={user} credits={currentCredits} onLogout={() => { logout(); navigate("/"); }} />

        <div style={{ ...s.content, ...(isMobile ? s.contentMobile : null) }}>
          <div style={{ ...s.header, ...(isMobile ? s.headerMobile : null) }}>
            <div>
              <p style={s.eyebrow}>Aspirant Workspace</p>
              <h1 style={{ ...s.title, ...(isMobile ? s.titleMobile : null) }}>Application Tracker</h1>
              <p style={{ ...s.subtitle, ...(isMobile ? s.subtitleMobile : null) }}>
                Save the forms you care about, track deadlines, and stay organized before admit card season gets messy.
              </p>
              <p style={s.modeNote}>
                {trackerMode === "cloud"
                  ? "Sync mode: saved to your account"
                  : "Local mode: saved on this device until tracker sync is available"}
              </p>
            </div>
            <div style={{ ...s.headerActions, ...(isMobile ? s.headerActionsMobile : null) }}>
              <button type="button" style={s.secondaryBtn} onClick={() => navigate("/dashboard")}>
                Open Tools
              </button>
              <button
                type="button"
                style={s.primaryBtn}
                onClick={() => document.getElementById("ff-tracker-form")?.scrollIntoView({ behavior: "smooth", block: "start" })}
              >
                Add Application
              </button>
            </div>
          </div>

          <div style={{ ...s.statsGrid, ...(isMobile ? s.statsGridMobile : null) }}>
            <div style={s.statCard}>
              <span style={s.statLabel}>Tracked</span>
              <strong style={s.statValue}>{counts.total}</strong>
              <span style={s.statHint}>All saved applications</span>
            </div>
            <div style={s.statCard}>
              <span style={s.statLabel}>Applied</span>
              <strong style={s.statValue}>{counts.applied}</strong>
              <span style={s.statHint}>Already submitted</span>
            </div>
            <div style={s.statCard}>
              <span style={s.statLabel}>Urgent</span>
              <strong style={s.statValue}>{counts.urgent}</strong>
              <span style={s.statHint}>Deadlines within 7 days</span>
            </div>
          </div>

          <div style={{ ...s.layout, ...(isMobile ? s.layoutMobile : null) }}>
            <div style={s.leftCol}>
              <form id="ff-tracker-form" style={s.formCard} onSubmit={handleCreate}>
                <div style={s.cardHead}>
                  <div>
                    <h2 style={s.cardTitle}>Add a form or exam</h2>
                    <p style={s.cardSub}>Start with the job/exam name and the last date. Update status later in one tap.</p>
                  </div>
                </div>

                <div style={{ ...s.formGrid, ...(isMobile ? s.formGridMobile : null) }}>
                  <label style={s.field}>
                    <span style={s.label}>Exam / Post Name</span>
                    <input
                      value={form.title}
                      onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="SSC CGL 2026, SBI Clerk, JEE Main Session 2"
                      style={s.input}
                    />
                  </label>

                  <label style={s.field}>
                    <span style={s.label}>Organization</span>
                    <input
                      value={form.organization}
                      onChange={(e) => setForm((prev) => ({ ...prev, organization: e.target.value }))}
                      placeholder="SSC, SBI, NTA, UPSC"
                      style={s.input}
                    />
                  </label>

                  <label style={s.field}>
                    <span style={s.label}>Category</span>
                    <input
                      value={form.category}
                      onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                      placeholder="Government Exam, Engineering Entrance, University Form"
                      style={s.input}
                    />
                  </label>

                  <label style={s.field}>
                    <span style={s.label}>Current Status</span>
                    <select
                      value={form.status}
                      onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                      style={s.input}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label style={s.field}>
                    <span style={s.label}>Deadline</span>
                    <input
                      type="date"
                      value={form.deadline}
                      onChange={(e) => setForm((prev) => ({ ...prev, deadline: e.target.value }))}
                      style={s.input}
                    />
                  </label>

                  <label style={s.field}>
                    <span style={s.label}>Official Link</span>
                    <input
                      value={form.officialLink}
                      onChange={(e) => setForm((prev) => ({ ...prev, officialLink: e.target.value }))}
                      placeholder="https://..."
                      style={s.input}
                    />
                  </label>

                  <label style={{ ...s.field, gridColumn: "1 / -1" }}>
                    <span style={s.label}>Notes</span>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                      placeholder="Photo size pending, category certificate needed, correction window expected..."
                      style={s.textarea}
                    />
                  </label>
                </div>

                {message ? <div style={s.successBox}>{message}</div> : null}
                {error ? <div style={s.errorBox}>{error}</div> : null}

                <div style={s.formActions}>
                  <button type="submit" style={{ ...s.primaryBtn, opacity: saving ? 0.7 : 1 }} disabled={saving}>
                    {saving ? "Saving..." : "Save to Tracker"}
                  </button>
                </div>
              </form>

              <div style={s.listCard}>
                <div style={s.cardHead}>
                  <div>
                    <h2 style={s.cardTitle}>Tracked applications</h2>
                    <p style={s.cardSub}>Update statuses, monitor deadlines, and keep your form journey clean.</p>
                  </div>
                  <div style={s.filters}>
                    {["All", ...STATUS_OPTIONS].map((status) => (
                      <button
                        key={status}
                        type="button"
                        style={{ ...s.filterBtn, ...(filter === status ? s.filterBtnActive : null) }}
                        onClick={() => setFilter(status)}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {loading ? (
                  <div style={s.emptyState}>Loading your tracker...</div>
                ) : filteredApplications.length === 0 ? (
                  <div style={s.emptyState}>
                    <strong style={s.emptyTitle}>No applications in this view yet.</strong>
                    <p style={s.emptyText}>Add your first form above. Start with the exact exam name and last date.</p>
                  </div>
                ) : (
                  <div style={s.items}>
                    {filteredApplications.map((item) => {
                      const left = daysLeft(item.deadline);
                      const urgent = left !== null && left >= 0 && left <= 7;
                      return (
                        <div key={item._id} style={{ ...s.itemCard, opacity: deletingId === item._id ? 0.55 : 1 }}>
                          <div style={s.itemTop}>
                            <div>
                              <h3 style={s.itemTitle}>{item.title}</h3>
                              <p style={s.itemOrg}>
                                {item.organization} • {item.category}
                              </p>
                            </div>
                            <span style={{ ...s.statusPill, ...(urgent ? s.statusUrgent : null) }}>
                              {item.status}
                            </span>
                          </div>

                          <div style={s.itemMeta}>
                            <span>Deadline: {formatDate(item.deadline)}</span>
                            {left !== null ? (
                              <span style={{ color: urgent ? "#f97316" : "var(--ff-text-faint)", fontWeight: urgent ? 800 : 700 }}>
                                {left < 0 ? `${Math.abs(left)} days late` : `${left} days left`}
                              </span>
                            ) : null}
                          </div>

                          {item.notes ? <p style={s.itemNotes}>{item.notes}</p> : null}

                          <div style={s.itemActions}>
                            <div style={s.statusRow}>
                              {STATUS_OPTIONS.map((status) => (
                                <button
                                  key={status}
                                  type="button"
                                  style={{ ...s.stageBtn, ...(item.status === status ? s.stageBtnActive : null) }}
                                  onClick={() => handleStatusChange(item, status)}
                                  disabled={updatingId === item._id}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                            <div style={s.actionRow}>
                              {item.officialLink ? (
                                <a href={item.officialLink} target="_blank" rel="noreferrer" style={s.linkBtn}>
                                  Open link
                                </a>
                              ) : null}
                              <button
                                type="button"
                                style={s.deleteBtn}
                                onClick={() => handleDelete(item._id)}
                                disabled={deletingId === item._id}
                              >
                                {deletingId === item._id ? "Removing..." : "Remove"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div style={s.rightCol}>
              <div style={s.sideCard}>
                <h3 style={s.sideTitle}>Upcoming deadlines</h3>
                <p style={s.sideSub}>See what needs attention first.</p>
                <div style={s.deadlineList}>
                  {upcoming.length === 0 ? (
                    <p style={s.sideEmpty}>Add applications with deadlines and they will appear here automatically.</p>
                  ) : (
                    upcoming.map((item) => (
                      <div key={item._id} style={s.deadlineItem}>
                        <strong style={s.deadlineTitle}>{item.title}</strong>
                        <span style={s.deadlineMeta}>{formatDate(item.deadline)}</span>
                        <span style={s.deadlineHint}>
                          {daysLeft(item.deadline) < 0 ? "Deadline passed" : `${daysLeft(item.deadline)} days left`}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div style={s.sideCard}>
                <h3 style={s.sideTitle}>What is coming next</h3>
                <p style={s.sideSub}>These bigger aspirant-platform features are planned, but not yet fully ready.</p>
                <div style={s.comingSoonList}>
                  {COMING_SOON.map((item) => (
                    <div key={item.title} style={s.comingSoonItem}>
                      <div style={{ ...s.comingSoonDot, background: item.accent }} />
                      <div>
                        <div style={s.comingSoonTop}>
                          <strong style={s.comingSoonTitle}>{item.title}</strong>
                          <span style={s.comingSoonBadge}>Coming Soon</span>
                        </div>
                        <p style={s.comingSoonDesc}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  root: { display: "flex", minHeight: "100vh", background: "transparent", fontFamily: "'Segoe UI', sans-serif" },
  main: { flex: 1, overflowY: "auto", paddingBottom: 48, minWidth: 0 },
  content: { maxWidth: 1180, width: "100%", margin: "0 auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 22, boxSizing: "border-box" },
  contentMobile: { padding: "16px", gap: 18 },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 18, flexWrap: "wrap" },
  headerMobile: { alignItems: "stretch" },
  eyebrow: { margin: "0 0 8px", color: "var(--ff-orange)", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.7 },
  title: { margin: "0 0 8px", color: "var(--ff-text)", fontSize: 30, fontWeight: 900, lineHeight: 1.08, letterSpacing: -0.8 },
  titleMobile: { fontSize: 24 },
  subtitle: { margin: 0, color: "var(--ff-text-soft)", fontSize: 15, lineHeight: 1.65, maxWidth: 740 },
  subtitleMobile: { fontSize: 14 },
  modeNote: { margin: "10px 0 0", color: "var(--ff-text-faint)", fontSize: 12, lineHeight: 1.6 },
  headerActions: { display: "flex", gap: 10, flexWrap: "wrap" },
  headerActionsMobile: { width: "100%" },
  primaryBtn: { background: "linear-gradient(135deg,#f97316,#ea580c)", color: "#fff", border: "none", borderRadius: 12, padding: "11px 16px", fontWeight: 800, fontSize: 14, cursor: "pointer" },
  secondaryBtn: { background: "var(--ff-panel-solid)", color: "var(--ff-text-soft)", border: "1px solid var(--ff-border)", borderRadius: 12, padding: "11px 16px", fontWeight: 800, fontSize: 14, cursor: "pointer" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 },
  statsGridMobile: { gridTemplateColumns: "1fr" },
  statCard: { background: "var(--ff-panel-solid)", border: "1px solid var(--ff-border)", borderRadius: 16, padding: "18px 18px 16px", display: "flex", flexDirection: "column", gap: 6, boxShadow: "var(--ff-shadow)" },
  statLabel: { color: "var(--ff-text-faint)", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.6 },
  statValue: { color: "var(--ff-text)", fontSize: 34, fontWeight: 900, lineHeight: 1 },
  statHint: { color: "var(--ff-text-soft)", fontSize: 13, lineHeight: 1.45 },
  layout: { display: "grid", gridTemplateColumns: "minmax(0, 1.5fr) minmax(300px, 0.8fr)", gap: 18, alignItems: "start" },
  layoutMobile: { gridTemplateColumns: "1fr" },
  leftCol: { display: "flex", flexDirection: "column", gap: 18 },
  rightCol: { display: "flex", flexDirection: "column", gap: 18 },
  formCard: { background: "var(--ff-panel-solid)", border: "1px solid var(--ff-border)", borderRadius: 18, padding: 20, display: "flex", flexDirection: "column", gap: 18, boxShadow: "var(--ff-shadow)" },
  listCard: { background: "var(--ff-panel-solid)", border: "1px solid var(--ff-border)", borderRadius: 18, padding: 20, display: "flex", flexDirection: "column", gap: 16, boxShadow: "var(--ff-shadow)" },
  sideCard: { background: "var(--ff-panel-solid)", border: "1px solid var(--ff-border)", borderRadius: 18, padding: 18, display: "flex", flexDirection: "column", gap: 14, boxShadow: "var(--ff-shadow)" },
  cardHead: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, flexWrap: "wrap" },
  cardTitle: { margin: "0 0 4px", color: "var(--ff-text)", fontSize: 18, fontWeight: 800 },
  cardSub: { margin: 0, color: "var(--ff-text-soft)", fontSize: 13, lineHeight: 1.55, maxWidth: 620 },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 },
  formGridMobile: { gridTemplateColumns: "1fr" },
  field: { display: "flex", flexDirection: "column", gap: 7, minWidth: 0 },
  label: { color: "var(--ff-text-soft)", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5 },
  input: { background: "var(--ff-panel-soft)", border: "1px solid var(--ff-border)", borderRadius: 12, padding: "12px 13px", color: "var(--ff-text)", fontSize: 14, outline: "none" },
  textarea: { minHeight: 96, resize: "vertical", background: "var(--ff-panel-soft)", border: "1px solid var(--ff-border)", borderRadius: 12, padding: "12px 13px", color: "var(--ff-text)", fontSize: 14, outline: "none", fontFamily: "inherit" },
  formActions: { display: "flex", justifyContent: "flex-end" },
  successBox: { background: "color-mix(in srgb, var(--ff-green) 10%, var(--ff-panel-solid))", border: "1px solid color-mix(in srgb, var(--ff-green) 26%, transparent)", color: "var(--ff-green)", borderRadius: 12, padding: "12px 14px", fontSize: 14, fontWeight: 700 },
  errorBox: { background: "color-mix(in srgb, #ef4444 9%, var(--ff-panel-solid))", border: "1px solid color-mix(in srgb, #ef4444 26%, transparent)", color: "#dc2626", borderRadius: 12, padding: "12px 14px", fontSize: 14, fontWeight: 700 },
  filters: { display: "flex", gap: 8, flexWrap: "wrap" },
  filterBtn: { background: "var(--ff-panel-soft)", border: "1px solid var(--ff-border)", color: "var(--ff-text-faint)", borderRadius: 999, padding: "7px 11px", fontSize: 12, fontWeight: 700, cursor: "pointer" },
  filterBtnActive: { background: "color-mix(in srgb, var(--ff-orange) 10%, transparent)", color: "var(--ff-orange)", borderColor: "color-mix(in srgb, var(--ff-orange) 24%, transparent)" },
  emptyState: { border: "1px dashed var(--ff-border)", borderRadius: 14, padding: "24px 18px", textAlign: "center", color: "var(--ff-text-soft)" },
  emptyTitle: { display: "block", color: "var(--ff-text)", marginBottom: 6, fontSize: 16 },
  emptyText: { margin: 0, fontSize: 14, lineHeight: 1.6 },
  items: { display: "flex", flexDirection: "column", gap: 12 },
  itemCard: { background: "var(--ff-panel-soft)", border: "1px solid var(--ff-border)", borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 12 },
  itemTop: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" },
  itemTitle: { margin: "0 0 3px", color: "var(--ff-text)", fontSize: 17, fontWeight: 800 },
  itemOrg: { margin: 0, color: "var(--ff-text-soft)", fontSize: 13, lineHeight: 1.5 },
  statusPill: { background: "color-mix(in srgb, var(--ff-blue) 10%, transparent)", color: "var(--ff-blue)", border: "1px solid color-mix(in srgb, var(--ff-blue) 24%, transparent)", borderRadius: 999, padding: "6px 10px", fontSize: 12, fontWeight: 800 },
  statusUrgent: { background: "color-mix(in srgb, var(--ff-orange) 10%, transparent)", color: "var(--ff-orange)", border: "1px solid color-mix(in srgb, var(--ff-orange) 24%, transparent)" },
  itemMeta: { display: "flex", gap: 10, justifyContent: "space-between", color: "var(--ff-text-faint)", fontSize: 12, flexWrap: "wrap" },
  itemNotes: { margin: 0, color: "var(--ff-text-soft)", fontSize: 14, lineHeight: 1.65 },
  itemActions: { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  statusRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  stageBtn: { background: "var(--ff-panel-solid)", border: "1px solid var(--ff-border)", color: "var(--ff-text-soft)", borderRadius: 999, padding: "7px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer" },
  stageBtnActive: { background: "color-mix(in srgb, var(--ff-orange) 10%, transparent)", borderColor: "color-mix(in srgb, var(--ff-orange) 24%, transparent)", color: "var(--ff-orange)" },
  actionRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  linkBtn: { background: "transparent", border: "1px solid var(--ff-border)", color: "var(--ff-text)", borderRadius: 10, padding: "9px 12px", fontSize: 13, fontWeight: 700, textDecoration: "none" },
  deleteBtn: { background: "transparent", border: "1px solid color-mix(in srgb, #ef4444 24%, transparent)", color: "#dc2626", borderRadius: 10, padding: "9px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  sideTitle: { margin: 0, color: "var(--ff-text)", fontSize: 17, fontWeight: 800 },
  sideSub: { margin: 0, color: "var(--ff-text-soft)", fontSize: 13, lineHeight: 1.55 },
  deadlineList: { display: "flex", flexDirection: "column", gap: 10 },
  sideEmpty: { margin: 0, color: "var(--ff-text-faint)", fontSize: 13, lineHeight: 1.6 },
  deadlineItem: { border: "1px solid var(--ff-border)", borderRadius: 12, padding: "12px 13px", display: "flex", flexDirection: "column", gap: 4, background: "var(--ff-panel-soft)" },
  deadlineTitle: { color: "var(--ff-text)", fontSize: 14 },
  deadlineMeta: { color: "var(--ff-text-soft)", fontSize: 12 },
  deadlineHint: { color: "var(--ff-orange)", fontSize: 12, fontWeight: 800 },
  comingSoonList: { display: "flex", flexDirection: "column", gap: 12 },
  comingSoonItem: { display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 0", borderTop: "1px solid var(--ff-border)" },
  comingSoonDot: { width: 10, height: 10, borderRadius: "50%", marginTop: 5, flexShrink: 0 },
  comingSoonTop: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 4 },
  comingSoonTitle: { color: "var(--ff-text)", fontSize: 14 },
  comingSoonBadge: { background: "var(--ff-panel-soft)", border: "1px solid var(--ff-border)", color: "var(--ff-text-faint)", borderRadius: 999, padding: "3px 8px", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.4 },
  comingSoonDesc: { margin: 0, color: "var(--ff-text-soft)", fontSize: 13, lineHeight: 1.55 },
};
