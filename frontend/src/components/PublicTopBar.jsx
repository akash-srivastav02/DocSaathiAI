import { useNavigate } from "react-router-dom";
import useLanguage from "../hooks/useLanguage";
import useTheme from "../hooks/useTheme";
import useIsMobile from "../hooks/useIsMobile";

export default function PublicTopBar() {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme, isDark } = useTheme();
  const isMobile = useIsMobile(820);

  const copy = language === "hi"
    ? {
        subtitle: "ऑफिशियल टूल हब",
        allTools: "सभी टूल्स",
        blog: "ब्लॉग",
        support: "सपोर्ट",
        light: "लाइट मोड",
        dark: "डार्क मोड",
      }
    : {
        subtitle: "Official tool hub",
        allTools: "All Tools",
        blog: "Blog",
        support: "Support",
        light: "Light Mode",
        dark: "Dark Mode",
      };

  return (
    <header
      style={{
        ...s.root,
        ...(isDark ? s.rootDark : s.rootLight),
        ...(isMobile ? s.rootMobile : null),
      }}
    >
      <button type="button" style={s.brand} onClick={() => navigate("/")}>
        <span style={s.logoWrap}>
          <img src="/favicon.png" alt="FormFixer logo" style={s.logo} />
        </span>
        <span style={s.brandTextWrap}>
          <strong style={s.brandTitle}>FormFixer</strong>
          {!isMobile ? <span style={s.brandSub}>{copy.subtitle}</span> : null}
        </span>
      </button>

      <div style={{ ...s.actions, ...(isMobile ? s.actionsMobile : null) }}>
        <div style={{ ...s.langSwitch, ...(isDark ? s.langSwitchDark : s.langSwitchLight) }}>
          <button
            type="button"
            style={{ ...s.langBtn, ...(language === "en" ? s.langActive : s.langIdle) }}
            onClick={() => setLanguage("en")}
          >
            EN
          </button>
          <button
            type="button"
            style={{ ...s.langBtn, ...(language === "hi" ? s.langActive : s.langIdle) }}
            onClick={() => setLanguage("hi")}
          >
            हिंदी
          </button>
        </div>
        <button type="button" style={{ ...s.ghostBtn, ...(isDark ? s.ghostDark : s.ghostLight) }} onClick={toggleTheme}>
          {theme === "dark" ? copy.light : copy.dark}
        </button>
        <button type="button" style={{ ...s.ghostBtn, ...(isDark ? s.ghostDark : s.ghostLight) }} onClick={() => navigate("/blog")}>
          {copy.blog}
        </button>
        <button type="button" style={s.primaryBtn} onClick={() => navigate("/all-tools")}>
          {copy.allTools}
        </button>
        {!isMobile ? (
          <button type="button" style={{ ...s.ghostBtn, ...(isDark ? s.ghostDark : s.ghostLight) }} onClick={() => navigate("/support")}>
            {copy.support}
          </button>
        ) : null}
      </div>
    </header>
  );
}

const s = {
  root: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 60,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "14px 18px",
    borderBottom: "1px solid rgba(148,163,184,0.14)",
    backdropFilter: "blur(18px)",
  },
  rootDark: {
    background: "rgba(7, 12, 24, 0.84)",
    color: "#f8fafc",
  },
  rootLight: {
    background: "rgba(255, 251, 245, 0.88)",
    color: "#162033",
  },
  rootMobile: {
    padding: "10px 12px",
    alignItems: "stretch",
    flexDirection: "column",
    gap: 10,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    border: "none",
    background: "transparent",
    color: "inherit",
    padding: 0,
    cursor: "pointer",
    textAlign: "left",
  },
  logoWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(249,115,22,0.12)",
    border: "1px solid rgba(249,115,22,0.22)",
  },
  logo: {
    width: 24,
    height: 24,
    objectFit: "contain",
  },
  brandTextWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  brandTitle: {
    fontSize: 20,
    lineHeight: 1,
    fontWeight: 900,
  },
  brandSub: {
    fontSize: 13,
    color: "#94a3b8",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  actionsMobile: {
    width: "100%",
    justifyContent: "space-between",
    gap: 8,
  },
  langSwitch: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: 4,
    borderRadius: 999,
    border: "1px solid transparent",
  },
  langSwitchDark: {
    background: "#111827",
    borderColor: "#334155",
  },
  langSwitchLight: {
    background: "#fff",
    borderColor: "rgba(133, 99, 66, 0.16)",
  },
  langBtn: {
    border: "none",
    borderRadius: 999,
    padding: "7px 12px",
    background: "transparent",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 13,
  },
  langActive: {
    background: "#f97316",
    color: "#fff",
  },
  langIdle: {
    color: "#94a3b8",
  },
  ghostBtn: {
    borderRadius: 999,
    border: "1px solid transparent",
    padding: "9px 14px",
    background: "transparent",
    fontWeight: 800,
    fontSize: 14,
    cursor: "pointer",
  },
  ghostDark: {
    background: "#111827",
    borderColor: "#334155",
    color: "#f8fafc",
  },
  ghostLight: {
    background: "#fff",
    borderColor: "rgba(133, 99, 66, 0.16)",
    color: "#162033",
  },
  primaryBtn: {
    border: "none",
    borderRadius: 999,
    padding: "10px 16px",
    background: "linear-gradient(135deg,#f97316,#ea580c)",
    color: "#fff",
    fontWeight: 800,
    fontSize: 14,
    cursor: "pointer",
  },
};
