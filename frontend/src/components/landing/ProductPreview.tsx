import BrowserMockup from "./BrowserMockup";
import PreviewChart from "./PreviewChart";
import PreviewEvidence from "./PreviewEvidence";
import PreviewHeader from "./PreviewHeader";
import PreviewSidebar from "./PreviewSidebar";
import PreviewTradePlan from "./PreviewTradePlan";

export default function ProductPreview() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 sm:px-8">
      <div className="mx-auto mb-14 max-w-3xl text-center">
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400">
          TRANSPARENT AI ANALYSIS
        </span>

        <h2 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          See exactly how AzaLens thinks.
        </h2>

        <p className="mt-5 text-lg leading-8 text-slate-400">
          Every verdict includes technical evidence, risk analysis and
          a clear trade plan—so you understand the reasoning before
          risking capital.
        </p>
      </div>

      <BrowserMockup>
        <div className="grid md:grid-cols-[190px_minmax(0,1fr)]">
          <PreviewSidebar />

          <div className="min-w-0 p-5 sm:p-7 lg:p-9">
            <PreviewHeader />

            <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.7fr)]">
              <div className="space-y-6">
                <PreviewChart />
                <PreviewEvidence />
              </div>

              <PreviewTradePlan />
            </div>
          </div>
        </div>
      </BrowserMockup>
    </section>
  );
}