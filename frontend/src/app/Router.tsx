import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "../pages/LandingPage";
import AnalysisPage from "../pages/AnalysisPage";
import ScannerPage from "../pages/ScannerPage";
import PortfolioPage from "../pages/PortfolioPage";
import SettingsPage from "../pages/SettingsPage";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<LandingPage />} />

        <Route path="/analysis/:symbol" element={<AnalysisPage />} />

        <Route path="/scanner" element={<ScannerPage />} />

        <Route path="/portfolio" element={<PortfolioPage />} />

        <Route path="/settings" element={<SettingsPage />} />

      </Routes>
    </BrowserRouter>
  );
}