import { useNavigate } from "react-router-dom";

export default function LegalPageLayout({ title, summary, updated, sections }) {
  const navigate = useNavigate();

  return (
    <div style={s.root}>
      <div style={s.wrap}>
        <div style={s.topBar}>
          <div>
            <p style={s.eyebrow}>FormFixer Legal</p>
            <h1 style={s.title}>{title}</h1>
            <p style={s.summary}>{summary}</p>
            <p style={s.updated}>Last updated: {updated}</p>
          </div>
          <div style={s.actions}>
            <button type="button" style={s.secondaryBtn} onClick={() => navigate("/")}>
              Home
            </button>
            <button type="button" style={s.primaryBtn} onClick={() => navigate("/auth")}>
              Open FormFixer
            </button>
          </div>
        </div>

        <div style={s.card}>
          {sections.map((section) => (
            <section key={section.heading} style={s.section}>
              <h2 style={s.sectionTitle}>{section.heading}</h2>
              <div style={s.body}>
                {section.paragraphs?.map((text) => (
                  <p key={text} style={s.paragraph}>
                    {text}
                  </p>
                ))}
                {section.points?.length ? (
                  <ul style={s.list}>
                    {section.points.map((point) => (
                      <li key={point} style={s.listItem}>
                        {point}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  root: {
    minHeight: "100vh",
    background: "transparent",
    fontFamily: "'Segoe UI', sans-serif",
    padding: "28px 16px 54px",
  },
  wrap: {
    maxWidth: 920,
    width: "100%",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  topBar: {
    background: "var(--ff-panel)",
    border: "1px solid var(--ff-border)",
    borderRadius: 18,
    padding: "22px 22px 20px",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 18,
    flexWrap: "wrap",
    boxShadow: "var(--ff-shadow)",
  },
  eyebrow: {
    margin: "0 0 8px",
    color: "var(--ff-orange)",
    fontSize: 12,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  title: {
    margin: "0 0 8px",
    color: "var(--ff-text)",
    fontSize: "clamp(28px, 5vw, 40px)",
    lineHeight: 1.04,
    fontWeight: 900,
    letterSpacing: -1.2,
  },
  summary: {
    margin: "0 0 8px",
    color: "var(--ff-text-soft)",
    fontSize: 15,
    lineHeight: 1.65,
    maxWidth: 680,
  },
  updated: {
    margin: 0,
    color: "var(--ff-text-faint)",
    fontSize: 13,
  },
  actions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  primaryBtn: {
    background: "linear-gradient(135deg,#f97316,#ea580c)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "11px 16px",
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
  },
  secondaryBtn: {
    background: "var(--ff-panel-solid)",
    color: "var(--ff-text-soft)",
    border: "1px solid var(--ff-border)",
    borderRadius: 12,
    padding: "11px 16px",
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
  },
  card: {
    background: "var(--ff-panel-solid)",
    border: "1px solid var(--ff-border)",
    borderRadius: 18,
    padding: "8px 22px",
    boxShadow: "var(--ff-shadow)",
  },
  section: {
    padding: "18px 0 20px",
    borderBottom: "1px solid var(--ff-border)",
  },
  sectionTitle: {
    margin: "0 0 10px",
    color: "var(--ff-text)",
    fontSize: 19,
    fontWeight: 800,
  },
  body: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  paragraph: {
    margin: 0,
    color: "var(--ff-text-soft)",
    fontSize: 14,
    lineHeight: 1.75,
  },
  list: {
    margin: "2px 0 0",
    paddingLeft: 20,
    color: "var(--ff-text-soft)",
  },
  listItem: {
    fontSize: 14,
    lineHeight: 1.75,
    marginBottom: 6,
  },
};
