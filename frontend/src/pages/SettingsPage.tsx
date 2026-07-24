import { Settings } from "lucide-react";

import AppPagePlaceholder from "../components/layout/AppPagePlaceholder";

export default function SettingsPage() {
  return (
    <AppPagePlaceholder
      eyebrow="Preferences"
      title="Settings"
      description="Appearance is already remembered across sessions. Account, notification, privacy and research preferences will inherit this same calm, responsive settings architecture."
      icon={Settings}
    />
  );
}
