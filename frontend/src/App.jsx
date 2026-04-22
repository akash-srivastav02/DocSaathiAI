import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth             from "./pages/Auth";
import Dashboard        from "./pages/Dashboard";
import ToolPage         from "./pages/ToolPage";
import Pricing          from "./pages/Pricing";
import PDFCompressPage  from "./pages/PDFCompressPage";
import useStore         from "./store/useStore";

function App() {
  const { user } = useStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"         element={user ? <Navigate to="/dashboard" /> : <Auth />} />

        {/* Protected */}
        <Route path="/dashboard"     element={user ? <Dashboard />       : <Navigate to="/" />} />
        <Route path="/tool/:toolId"  element={user ? <ToolPage />        : <Navigate to="/" />} />
        <Route path="/pricing"       element={user ? <Pricing />         : <Navigate to="/" />} />
        <Route path="/pdf/compress"  element={user ? <PDFCompressPage /> : <Navigate to="/" />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
