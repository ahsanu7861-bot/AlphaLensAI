import { BriefcaseBusiness } from "lucide-react";

import AppPagePlaceholder from "../components/layout/AppPagePlaceholder";

export default function PortfolioPage() {
  return (
    <AppPagePlaceholder
      eyebrow="Portfolio intelligence"
      title="Portfolio"
      description="The new workspace foundation is ready for positions, allocation, performance, risk concentration and portfolio-level AAOIFI monitoring. Live portfolio intelligence will be connected as a Pro module."
      icon={BriefcaseBusiness}
    />
  );
}
