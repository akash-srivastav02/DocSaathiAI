import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth            from "./pages/Auth";
import Dashboard       from "./pages/Dashboard";
import ToolPage        from "./pages/ToolPage";
import PDFCompressPage from "./pages/PDFCompressPage";
import Support         from "./pages/Support";
import MergerPage      from "./pages/MergerPage";
import Pricing         from "./pages/Pricing";
import Vault           from "./pages/Vault";
import useStore        from "./store/useStore";

// Protected route wrapper
function Protected({ children }) {
  const { user } = useStore();
  return user ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<AuthGate />} />

        <Route path="/tool/:toolId" element={<ToolPage />} />
        <Route path="/pdf/compress" element={<PDFCompressPage />} />
        <Route path="/merger"       element={<MergerPage />} />

        {/* Protected */}
        <Route path="/dashboard"    element={<Protected><Dashboard /></Protected>} />
        <Route path="/support"      element={<Protected><Support /></Protected>} />
        <Route path="/pricing"      element={<Protected><Pricing /></Protected>} />
        <Route path="/vault"        element={<Protected><Vault /></Protected>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function AuthGate() {
  const { user } = useStore();
  return user ? <Navigate to="/dashboard" replace /> : <Auth />;
}

export default App;
