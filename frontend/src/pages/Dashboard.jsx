import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import PublicTopBar from "../components/PublicTopBar";
import useLanguage from "../hooks/useLanguage";
import useIsMobile from "../hooks/useIsMobile";
import { TOOL_CATEGORIES } from "../utils/toolCatalog";
import { EXAM_PAGE_DATA } from "../utils/examPages";
import Seo from "../components/Seo";

function ToolCard({ item, onOpen }) {
  return (
    <button type="button" onClick={() => onOpen(item.route)} style={s.toolCard}>
      <div style={s.toolCardTop}>
        <span style={{ ...s.toolIcon, background: `${item.accent}14`, color: item.accent }}>
          {item.icon}
        </span>
      </div>
      <h3 style={s.toolTitle}>{item.label}</h3>
      <p style={s.toolDesc}>{item.desc}</p>
      <span style={{ ...s.toolFooter, color: item.accent }}>Open section</span>
    </button>
  );
}

function ExamCard({ exam, onOpen }) {
  return (
    <button type="button" style={s.examCard} onClick={() => onOpen(`/exam/${exam.slug}`)}>
      <span style={s.examBadge}>{exam.family}</span>
      <h3 style={s.examTitle}>{exam.name}</h3>
      <p style={s.examText}>{exam.summary}</p>
      <span style={s.examAction}>Open exam page</span>
    </button>
  );
}

export default function Dashboard({ mode = "dashboard" }) {
  const { user, credits, logout } = useStore();
  const navigate = useNavigate();
  const isMobile = useIsMobile(900);
  const { language } = useLanguage();
  const isHubMode = mode === "hub";
  const currentCredits = user ? credits ?? user?.credits ?? 0 : 0;
  const [examQuery, setExamQuery] = useState("");

  const copy = language === "hi"
    ? {
        badge: "एग्जाम टूलकिट",
        title: "FormFixer Exam Hub",
        text: "Exam search, exam tool cards aur saare exam guides ek jagah se direct access karo.",
        mappedTools: "Live sections",
        searchTitle: "Search Your Exam",
        searchSub: "Exam ka naam likho aur direct uska card aur guide kholo.",
        searchPlaceholder: "SSC CGL, UPSC CDS, NEET UG, IBPS Clerk...",
        toolsTitle: "Exam Section",
        toolsSub: "Yahan exam photo, exam sign aur related flows ke entry cards hain.",
        examsTitle: "All Exams",
        examsSub: "Neeche available saare exams ke cards diye gaye hain.",
        noExams: "Is search ke liye koi exam match nahin mila.",
      }
    : {
        badge: isHubMode ? "Exam Tools Hub" : "Exam Toolkit",
        title: "FormFixer Exam Hub",
        text: "Search your exam, open exam tool cards, and browse all exam guides from one direct-access page.",
        mappedTools: "Live sections",
        searchTitle: "Search Your Exam",
        searchSub: "Type an exam name and jump directly to the matching requirement page.",
        searchPlaceholder: "SSC CGL, UPSC CDS, NEET UG, IBPS Clerk...",
        toolsTitle: "Exam Section",
        toolsSub: "These cards cover exam photo, exam signature, printable sheet, and requirement-led flows.",
        examsTitle: "All Exams",
        examsSub: "Browse every available exam card below.",
        noExams: "No exam matched this search.",
      };

  const examTools = TOOL_CATEGORIES[0]?.items || [];
  const filteredExams = useMemo(() => {
    const q = examQuery.trim().toLowerCase();
    if (!q) return EXAM_PAGE_DATA;
    return EXAM_PAGE_DATA.filter((exam) =>
      exam.name.toLowerCase().includes(q) ||
      exam.family.toLowerCase().includes(q) ||
      exam.summary.toLowerCase().includes(q)
    );
  }, [examQuery]);

  const siteUrl = "https://formfixer.in";
  const hubSchema = isHubMode
    ? [
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "FormFixer Exam Hub",
          url: siteUrl,
          description: "Search exams, open exam tool cards, and browse all FormFixer exam requirement pages from one direct-access hub.",
        },
      ]
    : [];

  return (
    <div style={s.root}>
      {isHubMode ? (
        <Seo
          title="Exam Hub | FormFixer SSC, UPSC, NEET, JEE and Banking Exam Guides"
          description="Search your exam, open exam tool cards, and browse all FormFixer exam requirement pages from one direct-access hub."
          canonical={siteUrl}
          keywords="FormFixer exam hub, exam search, SSC CGL photo size, UPSC CDS photo size, NEET UG photo size, IBPS Clerk photo size"
          type="website"
          ldJson={hubSchema}
        />
      ) : null}

      {user ? (
        <Sidebar
          credits={currentCredits}
          planLabel={user?.planLabel}
          isUnlimited={user?.isUnlimited}
          showPlanCard={false}
          onLogout={() => { logout(); navigate("/"); }}
          activeNav="Dashboard"
        />
      ) : null}

      <div style={s.main}>
        {user ? (
          <TopBar
            user={user}
            credits={currentCredits}
            showPlanSummary={false}
            hasSidebar
            onLogout={() => { logout(); navigate("/"); }}
          />
        ) : (
          <PublicTopBar />
        )}

        <div style={{ ...s.content, ...(isMobile ? s.contentMobile : null), ...s.contentWithFixedTopbar }}>
          <section style={s.heroBand}>
            <div style={s.heroGlow} />
            <div style={s.heroCopy}>
              <span style={s.heroBadge}>{copy.badge}</span>
              <h1 style={{ ...s.heroTitle, ...(isMobile ? s.heroTitleMobile : null) }}>{copy.title}</h1>
              <p style={s.heroText}>{copy.text}</p>
            </div>
            <div style={s.heroStats}>
              <div style={s.statTile}>
                <strong style={s.statNum}>{examTools.length + EXAM_PAGE_DATA.length}</strong>
                <span style={s.statLabel}>{copy.mappedTools}</span>
              </div>
            </div>
          </section>

          <section style={s.section}>
            <div style={s.sectionHead}>
              <div>
                <h2 style={s.sectionTitle}>{copy.searchTitle}</h2>
                <p style={s.sectionSub}>{copy.searchSub}</p>
              </div>
            </div>
            <div style={s.searchShell}>
              <input
                type="text"
                value={examQuery}
                onChange={(e) => setExamQuery(e.target.value)}
                placeholder={copy.searchPlaceholder}
                style={s.searchInput}
              />
            </div>
            {examQuery.trim() ? (
              filteredExams.length ? (
                <div style={{ ...s.cardGrid, ...(isMobile ? s.cardGridCompact : null) }}>
                  {filteredExams.slice(0, 8).map((exam) => (
                    <ExamCard key={exam.slug} exam={exam} onOpen={navigate} />
                  ))}
                </div>
              ) : (
                <div style={s.emptyState}>{copy.noExams}</div>
              )
            ) : null}
          </section>

          <section style={s.section}>
            <div style={s.sectionHead}>
              <div>
                <h2 style={s.sectionTitle}>{copy.toolsTitle}</h2>
                <p style={s.sectionSub}>{copy.toolsSub}</p>
              </div>
            </div>
            <div style={{ ...s.cardGrid, ...(isMobile ? s.cardGridCompact : null) }}>
              {examTools.map((item) => (
                <ToolCard key={item.id} item={item} onOpen={navigate} />
              ))}
            </div>
          </section>

          <section style={s.section}>
            <div style={s.sectionHead}>
              <div>
                <h2 style={s.sectionTitle}>{copy.examsTitle}</h2>
                <p style={s.sectionSub}>{copy.examsSub}</p>
              </div>
            </div>
            <div style={{ ...s.cardGrid, ...(isMobile ? s.cardGridCompact : null) }}>
              {(examQuery.trim() ? filteredExams : EXAM_PAGE_DATA).map((exam) => (
                <ExamCard key={exam.slug} exam={exam} onOpen={navigate} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

const s = {
  root: {
    display: "flex",
    minHeight: "100vh",
    background: "transparent",
    fontFamily: "'Segoe UI', sans-serif",
  },
  main: { flex: 1, minWidth: 0, overflowX: "hidden" },
  content: {
    maxWidth: 1220,
    margin: "0 auto",
    padding: "28px 24px 56px",
    display: "flex",
    flexDirection: "column",
    gap: 30,
  },
  contentMobile: { padding: "18px 14px 44px", gap: 24 },
  contentWithFixedTopbar: { paddingTop: 104 },
  heroBand: {
    position: "relative",
    display: "flex",
    alignItems: "stretch",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
    padding: "28px",
    borderRadius: 22,
    background: "linear-gradient(135deg, #2563eb, #7c3aed 58%, #db2777)",
    color: "#fff",
    boxShadow: "0 26px 60px rgba(37, 99, 235, 0.24)",
    overflow: "hidden",
  },
  heroGlow: {
    position: "absolute",
    inset: "auto -40px -60px auto",
    width: 220,
    height: 220,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%)",
    pointerEvents: "none",
  },
  heroCopy: { display: "flex", flexDirection: "column", gap: 10, maxWidth: 720, position: "relative", zIndex: 1 },
  heroBadge: {
    width: "fit-content",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.16)",
    border: "1px solid rgba(255,255,255,0.2)",
    fontSize: 12,
    fontWeight: 800,
  },
  heroTitle: { margin: 0, fontSize: 46, lineHeight: 1.05, fontWeight: 900, letterSpacing: -1.6 },
  heroTitleMobile: { fontSize: 32, lineHeight: 1.08, letterSpacing: -0.8 },
  heroText: { margin: 0, fontSize: 18, lineHeight: 1.7, color: "rgba(255,255,255,0.9)" },
  heroStats: { display: "grid", gap: 12, minWidth: 180, alignContent: "start", position: "relative", zIndex: 1 },
  statTile: {
    padding: "18px 16px",
    borderRadius: 18,
    background: "rgba(255,255,255,0.16)",
    border: "1px solid rgba(255,255,255,0.18)",
    display: "grid",
    gap: 6,
  },
  statNum: { fontSize: 34, lineHeight: 1, fontWeight: 900 },
  statLabel: { fontSize: 13, color: "rgba(255,255,255,0.86)" },
  section: { display: "grid", gap: 16 },
  sectionHead: { display: "flex", alignItems: "end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  sectionTitle: { margin: 0, color: "var(--ff-text)", fontSize: 34, lineHeight: 1.06, fontWeight: 900, letterSpacing: -0.8 },
  sectionSub: { margin: "6px 0 0", color: "var(--ff-text-soft)", fontSize: 15, lineHeight: 1.7 },
  searchShell: {
    borderRadius: 20,
    border: "1px solid var(--ff-border)",
    background: "var(--ff-panel-solid)",
    padding: 12,
  },
  searchInput: {
    width: "100%",
    borderRadius: 14,
    border: "1px solid var(--ff-border)",
    background: "var(--ff-panel)",
    color: "var(--ff-text)",
    padding: "15px 16px",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
  },
  emptyState: {
    borderRadius: 18,
    border: "1px solid var(--ff-border)",
    background: "var(--ff-panel-solid)",
    color: "var(--ff-text-soft)",
    padding: "16px 18px",
    fontSize: 14,
  },
  cardGrid: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 },
  cardGridCompact: { gridTemplateColumns: "1fr 1fr" },
  toolCard: {
    borderRadius: 18,
    border: "1px solid var(--ff-border)",
    background: "var(--ff-panel-solid)",
    padding: "18px 18px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    textAlign: "left",
    cursor: "pointer",
  },
  toolCardTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  toolIcon: {
    minWidth: 44,
    height: 44,
    padding: "0 10px",
    borderRadius: 13,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 900,
    letterSpacing: 0.2,
  },
  toolTitle: { margin: 0, color: "var(--ff-text)", fontSize: 22, lineHeight: 1.18, fontWeight: 900, letterSpacing: -0.5 },
  toolDesc: { margin: 0, color: "var(--ff-text-soft)", fontSize: 14, lineHeight: 1.65, minHeight: 46 },
  toolFooter: { marginTop: "auto", fontSize: 13, fontWeight: 800 },
  examCard: {
    borderRadius: 18,
    border: "1px solid var(--ff-border)",
    background: "var(--ff-panel-solid)",
    padding: "18px 18px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    textAlign: "left",
    cursor: "pointer",
  },
  examBadge: {
    width: "fit-content",
    borderRadius: 999,
    padding: "5px 10px",
    background: "color-mix(in srgb, var(--ff-blue) 10%, transparent)",
    border: "1px solid color-mix(in srgb, var(--ff-blue) 24%, transparent)",
    color: "var(--ff-blue)",
    fontSize: 12,
    fontWeight: 800,
  },
  examTitle: { margin: 0, color: "var(--ff-text)", fontSize: 21, lineHeight: 1.2, fontWeight: 900 },
  examText: { margin: 0, color: "var(--ff-text-soft)", fontSize: 14, lineHeight: 1.65, minHeight: 48 },
  examAction: { marginTop: "auto", color: "var(--ff-orange)", fontSize: 13, fontWeight: 800 },
};
