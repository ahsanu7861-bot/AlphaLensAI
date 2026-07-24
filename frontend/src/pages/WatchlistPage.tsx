import { ListChecks } from "lucide-react";

import AppPagePlaceholder from "../components/layout/AppPagePlaceholder";

export default function WatchlistPage() {
  return (
    <AppPagePlaceholder
      eyebrow="Investor workspace"
      title="Watchlists"
      description="The premium shell is ready for focused lists, evidence changes, AAOIFI status monitoring and alert rules. The data workflow will be connected in its dedicated module."
      icon={ListChecks}
    />
  );
}
