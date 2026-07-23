import { useParams } from "react-router-dom";

import { Sidebar } from "../components/dashboard/Sidebar";
import { AIVerdict, CompanyOverview, MarketStructure, TechnicalEvidence, RiskAssessment, IslamicCompliance, AIReasoning, TradePlan, } from "../components/analysis";
import { Container } from "../components/ui";

export default function AnalysisPage() {
  const { symbol = "AAPL" } = useParams();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Sidebar />

      <main className="min-h-screen lg:pl-64">
        <Container className="py-8 sm:py-10">
          <div className="mb-6">

           <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
  AI Stock Intelligence Report
</p>

            <p className="mt-2 text-sm text-slate-500">
              Analysis for {symbol.toUpperCase()}
            </p>
          </div>

          <CompanyOverview />
          <AIVerdict />
          <MarketStructure />
          <TechnicalEvidence />
          <RiskAssessment />
          <IslamicCompliance />
          <AIReasoning />
          <TradePlan />
        </Container>
      </main>
    </div>
  );
}