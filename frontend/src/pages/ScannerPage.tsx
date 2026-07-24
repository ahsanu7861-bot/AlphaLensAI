import { Radar } from "lucide-react";

import AppPagePlaceholder from "../components/layout/AppPagePlaceholder";

export default function ScannerPage() {
  return (
    <AppPagePlaceholder
      eyebrow="Market discovery"
      title="Stock Screener"
      description="The discovery workspace will combine filters, movers, heatmaps and explainable evidence without leaving the stocks-only AzaLens universe. Scanner data and saved screens will arrive in their dedicated phase."
      icon={Radar}
    />
  );
}
