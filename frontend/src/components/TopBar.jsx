import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useIsMobile from "../hooks/useIsMobile";
import useLanguage from "../hooks/useLanguage";
import useTheme from "../hooks/useTheme";

const ACCOUNT_LINKS = [
  { key: "allTools", path: "/all-tools" },
  { key: "pricing", path: "/pricing" },
  { key: "contact", path: "/support" },
];

const normalizePlanLabel = (user, fallback) => {
  const raw = String(user?.planLabel || user?.planName || "").trim();
  if (!raw) return fallback;
  if (user?.isUnlimited || /unlimited/i.test(raw)) return "Unlimited Tier";
  if (/pro tier/i.test(raw)) return "Pro Tier";
  if (/starter tier/i.test(raw)) return "Starter Tier";
  if (/single pass/i.test(raw)) return "Single Pass";
  const remaining = Number(user?.credits ?? 0);
  if (remaining >= 100) return "Pro Tier";
  if (remaining >= 40) return "Starter Tier";
  if (remaining > 0 && remaining <= 1) return "Single Pass";
  return fallback;
};

const COPY = {
  en: {
    welcome: "Welcome",
    freeTier: "Free Tier",
    unlimited: "Unlimited access",
    downloadsLeft: (count) => `${count} downloads left`,
    allTools: "All Tools",
    pricing: "Pricing",
    contact: "Contact",
    logout: "Logout",
    guestLabel: "Browse tools",
    language: "Language",
  },
  hi: {
    welcome: "स्वागत",
    freeTier: "फ्री टियर",
    unlimited: "अनलिमिटेड एक्सेस",
    downloadsLeft: (count) => `${count} डाउनलोड बाकी`,
    allTools: "सभी टूल्स",
    pricing: "प्लान्स",
    contact: "संपर्क",
    logout: "लॉगआउट",
    guestLabel: "टूल्स देखें",
    language: "भाषा",
  },
};

export default function TopBar({
  user,
  credits,
  onLogout,
  showPlanSummary = true,
  hasSidebar = true,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile(900);
  const { theme, isDark, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const copy = COPY[language] || COPY.en;
  const [showMenu, setShowMenu] = useState(false);
  const t = isDark ? darkTheme : lightTheme;

  const isGuest = !user || !user.name;
  const firstName = !isGuest ? user.name.split(" ")[0] : copy.guestLabel;
  const planLabel = normalizePlanLabel(user, copy.freeTier);
  const usageSummary = user?.isUnlimited ? copy.unlimited : copy.downloadsLeft(credits ?? 0);

  const accountLinks = useMemo(
    () =>
      ACCOUNT_LINKS.map((item) => ({
        ...item,
        label:
          item.key === "allTools" ? copy.allTools :
          item.key === "pricing" ? copy.pricing :
          copy.contact,
      })),
    [copy]
  );

  useEffect(() => {
    setShowMenu(false);
  }, [location.pathname]);

  return (
    <div
      style={{
        ...s.topbar,
        ...t.topbar,
        ...(isMobile ? s.topbarMobile : null),
        ...(!isMobile && !hasSidebar ? s.topbarNoSidebar : null),
      }}
    >
      <button
        type="button"
        style={{ ...s.brandButton, ...(isMobile ? s.brandButtonMobile : null) }}
        onClick={() => navigate("/")}
      >
        <div style={{ ...s.brandIconWrap, ...t.brandIconWrap }}>
          <img src="/favicon.png" alt="FormFixer logo" style={s.brandIcon} />
        </div>
        <div style={s.brandCopy}>
          <p style={{ ...s.brandTitle, ...t.brandTitle }}>FormFixer</p>
          <p style={{ ...s.brandSub, ...t.brandSub }}>
            {isGuest ? copy.guestLabel : `${copy.welcome}, ${firstName}`}
          </p>
        </div>
      </button>

      <div style={{ ...s.actions, ...(isMobile ? s.actionsMobile : null) }}>
        <div style={{ ...s.langSwitch, ...t.langSwitch }}>
          <button
            type="button"
            style={{
              ...s.langOption,
              ...(language === "en" ? s.langOptionActive : null),
              ...(language === "en" ? t.langOptionActive : t.langOptionInactive),
            }}
            onClick={() => setLanguage("en")}
          >
            EN
          </button>
          <button
            type="button"
            style={{
              ...s.langOption,
              ...(language === "hi" ? s.langOptionActive : null),
              ...(language === "hi" ? t.langOptionActive : t.langOptionInactive),
            }}
            onClick={() => setLanguage("hi")}
          >
            हिन्दी
          </button>
        </div>

        <button type="button" style={{ ...s.themeBtn, ...t.themeBtn }} onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? "☀" : "☾"}
        </button>

        {showPlanSummary && !isGuest ? (
          <button type="button" style={{ ...s.planPill, ...t.planPill }} onClick={() => navigate("/pricing")}>
            <span style={s.planBolt}>⚡</span>
            <div style={s.planTextWrap}>
              <b style={s.planName}>{planLabel}</b>
              {!isMobile ? <span style={{ ...s.planSub, ...t.planSub }}>{usageSummary}</span> : null}
            </div>
          </button>
        ) : null}

        <div style={s.avatarWrap}>
          <button type="button" style={s.avatarBtn} onClick={() => setShowMenu((prev) => !prev)} aria-label="Open account menu">
            <div style={{ ...s.avatar, ...t.avatar }}>{isGuest ? "G" : user.name?.[0]?.toUpperCase() || "U"}</div>
          </button>

          {showMenu ? (
            <div style={{ ...s.menu, ...t.menu, ...(isMobile ? s.menuMobile : null) }}>
              <div style={{ ...s.menuHead, ...t.menuHead }}>
                <p style={{ ...s.menuBrand, ...t.menuBrand }}>FormFixer</p>
                <p style={{ ...s.menuName, ...t.menuName }}>{firstName}</p>
              </div>
              <div style={s.menuLinks}>
                {accountLinks.map((item) => (
                  <button
                    key={item.path}
                    type="button"
                    style={{
                      ...s.menuLink,
                      ...t.menuLink,
                      ...(location.pathname.startsWith(item.path) ? s.menuLinkActive : null),
                      ...(location.pathname.startsWith(item.path) ? t.menuLinkActive : null),
                    }}
                    onClick={() => navigate(item.path)}
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  type="button"
                  style={{ ...s.menuLink, ...t.menuLink }}
                  onClick={() => setLanguage(language === "en" ? "hi" : "en")}
                >
                  {copy.language}: {language === "en" ? "English" : "हिन्दी"}
                </button>
                {onLogout ? (
                  <button type="button" style={{ ...s.menuLogout, ...t.menuLogout }} onClick={onLogout}>
                    {copy.logout}
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const s = {
  topbar: {
    position: "fixed",
    top: 0,
    left: 292,
    right: 0,
    zIndex: 46,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    padding: "14px 22px",
  },
  topbarNoSidebar: { left: 0 },
  topbarMobile: { left: 0, right: 0, padding: "10px 14px 10px 62px" },
  brandButton: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
    border: "none",
    background: "transparent",
    padding: 0,
    cursor: "pointer",
    textAlign: "left",
  },
  brandButtonMobile: { flex: 1, minWidth: 0 },
  brandIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },
  brandIcon: { width: 27, height: 27, objectFit: "contain", display: "block" },
  brandCopy: { minWidth: 0, display: "flex", flexDirection: "column", gap: 2 },
  brandTitle: { margin: 0, fontSize: 19, fontWeight: 900, lineHeight: 1.1, letterSpacing: -0.3 },
  brandSub: { margin: 0, fontSize: 14, fontWeight: 600, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  actions: { display: "flex", alignItems: "center", gap: 10 },
  actionsMobile: { gap: 8 },
  langSwitch: { display: "inline-flex", alignItems: "center", gap: 4, padding: 4, borderRadius: 999, border: "1px solid transparent" },
  langOption: { minWidth: 38, border: "none", borderRadius: 999, padding: "7px 10px", cursor: "pointer", fontSize: 12, fontWeight: 900, transition: "background .16s ease, color .16s ease, box-shadow .16s ease" },
  langOptionActive: { boxShadow: "0 10px 22px rgba(249, 115, 22, 0.24)" },
  themeBtn: { width: 38, height: 38, borderRadius: 12, border: "1px solid transparent", background: "transparent", cursor: "pointer", fontWeight: 900, fontSize: 15 },
  planPill: { display: "flex", alignItems: "center", gap: 8, borderRadius: 999, padding: "8px 14px", border: "1px solid transparent", cursor: "pointer" },
  planBolt: { fontSize: 15, lineHeight: 1 },
  planTextWrap: { display: "flex", flexDirection: "column", gap: 1, textAlign: "left" },
  planName: { color: "#f97316", fontSize: 14, lineHeight: 1.1 },
  planSub: { fontSize: 12, lineHeight: 1.2 },
  avatarWrap: { position: "relative" },
  avatarBtn: { border: "none", background: "transparent", padding: 0, cursor: "pointer" },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: 15,
    fontWeight: 900,
    background: "linear-gradient(135deg,#f97316,#7c3aed)",
  },
  menu: { position: "absolute", top: "calc(100% + 10px)", right: 0, width: 220, borderRadius: 14, padding: 10, zIndex: 60 },
  menuMobile: { width: 220 },
  menuHead: { padding: "6px 6px 10px", marginBottom: 8 },
  menuBrand: { margin: 0, fontSize: 13, fontWeight: 900 },
  menuName: { margin: "4px 0 0", fontSize: 12 },
  menuLinks: { display: "grid", gap: 6 },
  menuLink: { width: "100%", textAlign: "left", border: "none", background: "transparent", borderRadius: 10, padding: "10px 12px", fontSize: 14, fontWeight: 700, cursor: "pointer" },
  menuLinkActive: {},
  menuLogout: { width: "100%", textAlign: "left", borderRadius: 10, padding: "10px 12px", fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 4 },
};

const darkTheme = {
  topbar: { background: "linear-gradient(180deg, rgba(10,15,30,0.98), rgba(13,20,33,0.94))", borderBottom: "1px solid rgba(79,97,130,0.18)", backdropFilter: "blur(20px)", boxShadow: "0 18px 42px rgba(2, 6, 23, 0.18)" },
  brandIconWrap: { background: "#f9731620", border: "1px solid #f9731633" },
  brandTitle: { color: "#f1f5f9" },
  brandSub: { color: "#94a3b8" },
  langSwitch: { background: "#111827", borderColor: "#334155" },
  langOptionActive: { background: "linear-gradient(135deg,#f97316,#ea580c)", color: "#ffffff" },
  langOptionInactive: { background: "transparent", color: "#94a3b8" },
  themeBtn: { color: "#e2e8f0", background: "#111827", borderColor: "#334155" },
  planPill: { background: "#f9731614", borderColor: "#f9731630" },
  planSub: { color: "#94a3b8" },
  avatar: { boxShadow: "0 10px 28px rgba(124, 58, 237, 0.24)" },
  menu: { background: "#0d1421", border: "1px solid #263246", boxShadow: "0 18px 40px rgba(0,0,0,0.35)" },
  menuHead: { borderBottom: "1px solid #1e293b" },
  menuBrand: { color: "#f1f5f9" },
  menuName: { color: "#94a3b8" },
  menuLink: { color: "#cbd5e1" },
  menuLinkActive: { background: "#f9731618", color: "#f97316" },
  menuLogout: { border: "1px solid #374151", background: "#1e293b", color: "#e2e8f0" },
};

const lightTheme = {
  topbar: { background: "linear-gradient(180deg, rgba(255,250,242,0.98), rgba(255,253,248,0.94))", borderBottom: "1px solid rgba(133, 99, 66, 0.14)", backdropFilter: "blur(20px)", boxShadow: "0 16px 36px rgba(148, 163, 184, 0.12)" },
  brandIconWrap: { background: "rgba(216, 90, 6, 0.08)", border: "1px solid rgba(216, 90, 6, 0.18)" },
  brandTitle: { color: "#162033" },
  brandSub: { color: "#6b7789" },
  langSwitch: { background: "#ffffff", borderColor: "rgba(133, 99, 66, 0.15)" },
  langOptionActive: { background: "linear-gradient(135deg,#f97316,#ea580c)", color: "#ffffff" },
  langOptionInactive: { background: "transparent", color: "#6b7789" },
  themeBtn: { color: "#162033", background: "#fff", borderColor: "rgba(133, 99, 66, 0.15)" },
  planPill: { background: "rgba(216, 90, 6, 0.08)", borderColor: "rgba(216, 90, 6, 0.18)" },
  planSub: { color: "#64748b" },
  avatar: { boxShadow: "0 10px 28px rgba(216, 90, 6, 0.16)" },
  menu: { background: "#fffdf8", border: "1px solid rgba(133, 99, 66, 0.16)", boxShadow: "0 18px 40px rgba(148, 163, 184, 0.22)" },
  menuHead: { borderBottom: "1px solid rgba(133, 99, 66, 0.12)" },
  menuBrand: { color: "#162033" },
  menuName: { color: "#64748b" },
  menuLink: { color: "#1f2a3d" },
  menuLinkActive: { background: "rgba(216, 90, 6, 0.08)", color: "#d85a06" },
  menuLogout: { border: "1px solid rgba(133, 99, 66, 0.18)", background: "#ffffff", color: "#162033" },
};
