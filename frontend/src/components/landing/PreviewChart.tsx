export default function PreviewChart() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">Market Structure</p>
          <p className="mt-1 text-2xl font-bold text-white">$213.50</p>
        </div>

        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-400">
          +2.84%
        </span>
      </div>

      <div className="mt-6 h-56">
        <svg
          viewBox="0 0 800 240"
          className="h-full w-full"
          preserveAspectRatio="none"
          role="img"
          aria-label="Upward-trending stock price chart"
        >
          <defs>
            <linearGradient
              id="preview-chart-fill"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[40, 90, 140, 190].map((y) => (
            <line
              key={y}
              x1="0"
              x2="800"
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
          ))}

          <path
            d="M0 205 C55 198 75 176 125 184 C180 192 195 145 245 154 C300 163 330 118 375 126 C425 135 452 90 500 103 C550 116 580 62 630 77 C680 91 715 44 800 30 L800 240 L0 240 Z"
            fill="url(#preview-chart-fill)"
          />

          <path
            d="M0 205 C55 198 75 176 125 184 C180 192 195 145 245 154 C300 163 330 118 375 126 C425 135 452 90 500 103 C550 116 580 62 630 77 C680 91 715 44 800 30"
            fill="none"
            stroke="#34d399"
            strokeWidth="4"
            strokeLinecap="round"
          />

          <circle cx="800" cy="30" r="6" fill="#34d399" />
        </svg>
      </div>

      <div className="mt-4 flex justify-between text-xs text-slate-600">
        <span>09:30</span>
        <span>11:00</span>
        <span>13:00</span>
        <span>16:00</span>
      </div>
    </div>
  );
}