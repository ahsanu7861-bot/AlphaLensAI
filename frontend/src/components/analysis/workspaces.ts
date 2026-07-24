export const workspaceIds = [
  "overview",
  "technical",
  "fundamentals",
  "risk",
  "shariah",
  "thesis",
] as const;

export type WorkspaceId = (typeof workspaceIds)[number];
