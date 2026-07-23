import { useParams } from "react-router-dom";

import { Sidebar } from "../components/dashboard/Sidebar";
import {
  AIVerdict,
  CompanyOverview,
  MarketStructure,
  TechnicalEvidence,
  RiskAssessment,
  IslamicCompliance,
  AIReasoning,
  TradePlan,
} from "../components/analysis";
import { Container } from "../components/ui";
import { useAnalysis } from "../hooks/useAnalysis";

export default function AnalysisPage() {
  const { symbol = "AAPL" } = useParams();
  const normalizedSymbol = symbol.trim().toUpperCase();
  const { data, isLoading, isError } = useAnalysis(normalizedSymbol);

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
              Analysis for {normalizedSymbol}
            </p>
          </div>

          {isError && (
            <div
              role="alert"
              className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200"
            >
              AzaLens could not analyze “{normalizedSymbol}”. Confirm the ticker
              and make sure the backend is running, then try again.
            </div>
          )}

          <CompanyOverview
            symbol={normalizedSymbol}
            market={data?.market}
            priceContext={data?.priceContext}
            isLoading={isLoading}
          />
          <AIVerdict
            direction={
              data?.agreement?.direction ?? data?.agreement?.agreement
            }
            trend={data?.trend?.trend}
            confidence={data?.agreement?.confidence}
            summary={
              data?.agreement?.agreementSummary ??
              data?.explanation?.overallAssessment
            }
            isLoading={isLoading}
          />
          <MarketStructure />
          <TechnicalEvidence
            indicators={data?.indicators}
            agreement={data?.agreement}
            currency={data?.market?.data?.currency}
            isLoading={isLoading}
          />
          <RiskAssessment
            risk={data?.risk}
            currency={data?.market?.data?.currency}
            isLoading={isLoading}
          />
          <IslamicCompliance />
          <AIReasoning />
          <TradePlan />
        </Container>
      </main>
    </div>
  );
}
