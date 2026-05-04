import { useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import Landing         from "./pages/Landing";
import Auth            from "./pages/Auth";
import ExamPage        from "./pages/ExamPage";
import UtilityPage     from "./pages/UtilityPage";
import Dashboard       from "./pages/Dashboard";
import ToolPage        from "./pages/ToolPage";
import PDFCompressPage from "./pages/PDFCompressPage";
import ImageToPdfPage  from "./pages/ImageToPdfPage";
import PassportSheetPage from "./pages/PassportSheetPage";
import MergePdfPage    from "./pages/MergePdfPage";
import SplitPdfPage    from "./pages/SplitPdfPage";
import Support         from "./pages/Support";
import MergerPage      from "./pages/MergerPage";
import Pricing         from "./pages/Pricing";
import PrivacyPage     from "./pages/PrivacyPage";
import TermsPage       from "./pages/TermsPage";
import BlogIndexPage   from "./pages/BlogIndexPage";
import BlogPostPage    from "./pages/BlogPostPage";
import useStore        from "./store/useStore";
import useTheme        from "./hooks/useTheme";

const INACTIVITY_LIMIT_MS = 8 * 60 * 60 * 1000;
const ACTIVITY_KEY = "formfixer_last_activity";

// Protected route wrapper
function Protected({ children }) {
  const { user } = useStore();
  return user ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <ThemedRoutes />
    </BrowserRouter>
  );
}

export default App;

function ThemedRoutes() {
  const { isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useStore();
  const timeoutRef = useRef(null);
  const isLanding = location.pathname === "/";
  const shellClass = [
    "ff-app-shell",
    isDark ? "ff-app-shell--dark" : "ff-app-shell--light",
    isLanding ? "ff-app-shell--landing" : "",
    !isLanding ? "ff-app-shell--standard" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={shellClass}>
      <SessionGuard
        user={user}
        logout={logout}
        navigate={navigate}
        pathname={location.pathname}
        timeoutRef={timeoutRef}
      />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/blog" element={<BlogIndexPage />} />
        <Route path="/blog/:blogSlug" element={<BlogPostPage />} />
        <Route path="/exam/:examSlug" element={<ExamPage />} />
        <Route path="/utility/:utilitySlug" element={<UtilityPage />} />

        <Route path="/tool/passport-sheet" element={<PassportSheetPage />} />
        <Route path="/all-tools" element={<Dashboard mode="hub" />} />
        <Route path="/tool/:toolId" element={<ToolPage />} />
        <Route path="/pdf/compress" element={<PDFCompressPage />} />
        <Route path="/pdf/merge" element={<MergePdfPage />} />
        <Route path="/pdf/split" element={<SplitPdfPage />} />
        <Route path="/pdf/image-to-pdf" element={<ImageToPdfPage />} />
        <Route path="/merger"       element={<MergerPage />} />
        <Route path="/support" element={<Support />} />
        <Route path="/privacy-policy" element={<PrivacyPage />} />
        <Route path="/terms-and-conditions" element={<TermsPage />} />

        {/* Protected */}
        <Route path="/dashboard"    element={<Protected><Dashboard mode="dashboard" /></Protected>} />
        <Route path="/pricing"      element={<Protected><Pricing /></Protected>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function SessionGuard({ user, logout, navigate, pathname, timeoutRef }) {
  useEffect(() => {
    if (!user) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return undefined;
    }

    const protectedPrefixes = ["/dashboard", "/pricing", "/support", "/tool/", "/pdf/", "/merger", "/all-tools"];

    const touch = () => {
      localStorage.setItem(ACTIVITY_KEY, String(Date.now()));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => {
        logout();
        if (protectedPrefixes.some((prefix) => pathname.startsWith(prefix))) {
          navigate("/", { replace: true });
        } else {
          window.location.replace("/");
        }
      }, INACTIVITY_LIMIT_MS);
    };

    const rawLast = Number(localStorage.getItem(ACTIVITY_KEY));
    const now = Date.now();
    if (rawLast && now - rawLast >= INACTIVITY_LIMIT_MS) {
      logout();
      navigate("/", { replace: true });
      return undefined;
    }

    touch();
    const events = ["pointerdown", "keydown", "scroll", "touchstart"];
    events.forEach((eventName) => window.addEventListener(eventName, touch, { passive: true }));
    window.addEventListener("focus", touch);

    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, touch));
      window.removeEventListener("focus", touch);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [logout, navigate, pathname, timeoutRef, user]);

  return null;
}
