import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  useTheme,
  type ThemePreference,
} from "../../app/providers/theme";

const options: Array<{
  value: ThemePreference;
  label: string;
  description: string;
  icon: typeof Sun;
}> = [
  {
    value: "system",
    label: "System",
    description: "Follow this device",
    icon: Monitor,
  },
  {
    value: "day",
    label: "Day",
    description: "Porcelain workspace",
    icon: Sun,
  },
  {
    value: "night",
    label: "Night",
    description: "Deep ink workspace",
    icon: Moon,
  },
];

export default function ThemeToggle() {
  const { preference, resolvedTheme, setPreference } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const ActiveIcon = resolvedTheme === "day" ? Sun : Moon;

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () =>
      document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Choose appearance"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="az-icon-button"
      >
        <ActiveIcon size={18} strokeWidth={1.8} />
      </button>

      {open && (
        <div className="az-popover absolute right-0 top-[calc(100%+10px)] w-64 p-2">
          <p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
            Appearance
          </p>

          {options.map(({ value, label, description, icon: Icon }) => {
            const isActive = preference === value;

            return (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setPreference(value);
                  setOpen(false);
                }}
                className={[
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
                  isActive
                    ? "bg-brand/10 text-brand"
                    : "text-ink-soft hover:bg-surface-soft hover:text-ink",
                ].join(" ")}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-stroke bg-surface">
                  <Icon size={17} strokeWidth={1.8} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className="block text-xs text-ink-muted">
                    {description}
                  </span>
                </span>

                {isActive && <Check size={16} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
