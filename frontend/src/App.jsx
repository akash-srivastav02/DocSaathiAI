import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth            from "./pages/Auth";
import Dashboard       from "./pages/Dashboard";
import ToolPage        from "./pages/ToolPage";
import Pricing         from "./pages/Pricing";
import PDFCompressPage from "./pages/PDFCompressPage";
import Support         from "./pages/Support";
import MergerPage      from "./pages/MergerPage";
import useStore        from "./store/useStore";

function App() {
  const { user } = useStore();
  const P = ({ children }) => user ? children : <Navigate to="/" />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"             element={user ? <Navigate to="/dashboard" /> : <Auth />} />
        <Route path="/dashboard"    element={<P><Dashboard /></P>} />
        <Route path="/tool/:toolId" element={<P><ToolPage /></P>} />
        <Route path="/pricing"      element={<P><Pricing /></P>} />
        <Route path="/pdf/compress" element={<P><PDFCompressPage /></P>} />
        <Route path="/support"      element={<P><Support /></P>} />
        <Route path="/merger"       element={<P><MergerPage /></P>} />
        <Route path="/vault"        element={<P><Dashboard /></P>} />
        <Route path="*"             element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
