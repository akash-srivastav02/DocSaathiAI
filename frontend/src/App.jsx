import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Landing         from "./pages/Landing";
import Auth            from "./pages/Auth";
import ExamPage        from "./pages/ExamPage";
import UtilityPage     from "./pages/UtilityPage";
import Dashboard       from "./pages/Dashboard";
import ToolPage        from "./pages/ToolPage";
import PDFCompressPage from "./pages/PDFCompressPage";
import ImageToPdfPage  from "./pages/ImageToPdfPage";
import Support         from "./pages/Support";
import MergerPage      from "./pages/MergerPage";
import Pricing         from "./pages/Pricing";
import PrivacyPage     from "./pages/PrivacyPage";
import TermsPage       from "./pages/TermsPage";
import Vault           from "./pages/Vault";
import useStore        from "./store/useStore";
import useTheme        from "./hooks/useTheme";

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
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/exam/:examSlug" element={<ExamPage />} />
        <Route path="/utility/:utilitySlug" element={<UtilityPage />} />

        <Route path="/tool/:toolId" element={<ToolPage />} />
        <Route path="/pdf/compress" element={<PDFCompressPage />} />
        <Route path="/pdf/image-to-pdf" element={<ImageToPdfPage />} />
        <Route path="/merger"       element={<MergerPage />} />
        <Route path="/privacy-policy" element={<PrivacyPage />} />
        <Route path="/terms-and-conditions" element={<TermsPage />} />

        {/* Protected */}
        <Route path="/dashboard"    element={<Protected><Dashboard /></Protected>} />
        <Route path="/support"      element={<Protected><Support /></Protected>} />
        <Route path="/pricing"      element={<Protected><Pricing /></Protected>} />
        <Route path="/vault"        element={<Protected><Vault /></Protected>} />
        <Route path="/tracker"      element={<Protected><Vault /></Protected>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
