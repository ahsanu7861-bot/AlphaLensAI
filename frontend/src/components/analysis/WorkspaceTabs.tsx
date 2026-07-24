import {
  Activity,
  BrainCircuit,
  Building2,
  Gauge,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";

import type { WorkspaceId } from "./workspaces";

type WorkspaceTabsProps = {
  activeWorkspace: WorkspaceId;
  onChange: (workspace: WorkspaceId) => void;
};

const workspaces: Array<{
  id: WorkspaceId;
  label: string;
  icon: typeof Activity;
}> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "technical", label: "Technical", icon: Activity },
  { id: "fundamentals", label: "Fundamentals", icon: Building2 },
  { id: "risk", label: "Risk", icon: Gauge },
  { id: "shariah", label: "Shariah", icon: ShieldCheck },
  { id: "thesis", label: "AI Thesis", icon: BrainCircuit },
];

export default function WorkspaceTabs({
  activeWorkspace,
  onChange,
}: WorkspaceTabsProps) {
  return (
    <div
      className="az-tab-scroller"
      role="tablist"
      aria-label="Analysis workspaces"
    >
      {workspaces.map(({ id, label, icon: Icon }) => {
        const isActive = activeWorkspace === id;

        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(id)}
            className={[
              "az-workspace-tab",
              isActive ? "az-workspace-tab-active" : "",
            ].join(" ")}
          >
            <Icon size={16} strokeWidth={1.8} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
