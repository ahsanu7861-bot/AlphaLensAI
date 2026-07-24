import { lazy, Suspense, type ReactNode } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import AppShell from "../components/layout/AppShell";

const AnalysisPage = lazy(() => import("../pages/AnalysisPage"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const LandingPage = lazy(() => import("../pages/LandingPage"));
const PortfolioPage = lazy(() => import("../pages/PortfolioPage"));
const ScannerPage = lazy(() => import("../pages/ScannerPage"));
const SettingsPage = lazy(() => import("../pages/SettingsPage"));
const WatchlistPage = lazy(() => import("../pages/WatchlistPage"));

function PageLoader() {
  return (
    <div className="grid min-h-[calc(100dvh-68px)] place-items-center bg-canvas px-6 text-center">
      <div>
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand/25 border-t-brand" />
        <p className="mt-4 text-sm font-medium text-ink-muted">
          Preparing your workspace…
        </p>
      </div>
    </div>
  );
}

function loadPage(page: ReactNode) {
  return <Suspense fallback={<PageLoader />}>{page}</Suspense>;
}

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={loadPage(<LandingPage />)} />
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={loadPage(<DashboardPage />)} />
          <Route path="/analysis/:symbol" element={loadPage(<AnalysisPage />)} />
          <Route path="/scanner" element={loadPage(<ScannerPage />)} />
          <Route path="/portfolio" element={loadPage(<PortfolioPage />)} />
          <Route path="/watchlist" element={loadPage(<WatchlistPage />)} />
          <Route path="/settings" element={loadPage(<SettingsPage />)} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
