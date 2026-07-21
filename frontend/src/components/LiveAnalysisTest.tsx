import { useAnalysis } from "../hooks/useAnalysis";

export default function LiveAnalysisTest() {
  const { data, isLoading, error } = useAnalysis("AAPL");

  if (isLoading) {
    return <div className="p-6">Loading AzaLens...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Failed to load analysis.</div>;
  }

  return (
    <div className="rounded-xl border border-emerald-500/20 bg-black/20 p-6">
      <h2 className="text-xl font-bold">Live Backend Test</h2>

      <p className="mt-4">
        Trend: <strong>{data?.trend?.trend}</strong>
      </p>

      <p>
        Score: <strong>{data?.trend?.score}</strong>
      </p>

      <p>
        Agreement: <strong>{data?.agreement?.confidence}%</strong>
      </p>

      <p>
        Risk: <strong>{data?.risk?.riskLevel}</strong>
      </p>

      <p>
        Shariah: <strong>{data?.shariah?.summary?.status}</strong>
      </p>

      <p className="mt-4 text-sm text-slate-400">
        {data?.explanation?.overallAssessment}
      </p>
    </div>
  );
}