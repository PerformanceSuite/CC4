import React, { useMemo } from 'react'

export type ProgressSlice = {
  id: string
  label: string
  /** 0..1 */
  weight?: number
  /** 0..1 */
  progress: number
  status?: 'pending' | 'running' | 'blocked' | 'complete' | 'failed'
}

export type ProgressRingProps = {
  /** 0..1 overall progress */
  progress: number
  /** clockwise or counterclockwise arrow */
  direction?: 'cw' | 'ccw'
  /** pixels */
  size?: number
  /** ring thickness */
  strokeWidth?: number
  /** optional inner label */
  label?: string
  /** optional slices (subtasks) shown as wedge segments */
  slices?: ProgressSlice[]
  /** optional outer options (like a shortcut wheel) */
  options?: Array<{ id: string; label: string; hint?: string }>
  onOptionClick?: (id: string) => void
}

function clamp01(n: number) {
  if (Number.isNaN(n)) return 0
  return Math.max(0, Math.min(1, n))
}

function polar(cx: number, cy: number, r: number, a: number) {
  // angle a in radians, 0 at 12 o'clock
  const x = cx + r * Math.cos(a - Math.PI / 2)
  const y = cy + r * Math.sin(a - Math.PI / 2)
  return { x, y }
}

function arcPath(cx: number, cy: number, rOuter: number, rInner: number, a0: number, a1: number) {
  const p0 = polar(cx, cy, rOuter, a0)
  const p1 = polar(cx, cy, rOuter, a1)
  const p2 = polar(cx, cy, rInner, a1)
  const p3 = polar(cx, cy, rInner, a0)

  const large = a1 - a0 > Math.PI ? 1 : 0
  return [
    `M ${p0.x} ${p0.y}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${p1.x} ${p1.y}`,
    `L ${p2.x} ${p2.y}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${p3.x} ${p3.y}`,
    'Z',
  ].join(' ')
}

export function ProgressRing({
  progress,
  direction = 'cw',
  size = 132,
  strokeWidth = 10,
  label,
  slices = [],
  options = [],
  onOptionClick,
}: ProgressRingProps) {
  const p = clamp01(progress)
  const r = size / 2
  const ringR = r - strokeWidth / 2
  const c = 2 * Math.PI * ringR
  const dash = c * p

  const { normalizedSlices, totalWeight } = useMemo(() => {
    const s = slices.length
      ? slices.map((x) => ({ ...x, weight: x.weight ?? 1, progress: clamp01(x.progress) }))
      : []
    const tw = s.reduce((acc, x) => acc + (x.weight ?? 1), 0) || 1
    return { normalizedSlices: s, totalWeight: tw }
  }, [slices])

  const arrow = useMemo(() => {
    const a = direction === 'cw' ? 1 : -1
    const theta = a * (2 * Math.PI * p)
    return polar(r, r, ringR + strokeWidth * 0.9, theta)
  }, [direction, p, r, ringR, strokeWidth])

  const optionDots = useMemo(() => {
    if (!options.length) return []
    const step = (2 * Math.PI) / options.length
    return options.map((opt, idx) => {
      const a0 = idx * step
      const pt = polar(r, r, ringR + strokeWidth * 2.2, a0)
      return { ...opt, x: pt.x, y: pt.y }
    })
  }, [options, r, ringR, strokeWidth])

  return (
    <div className="relative select-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
        <circle
          cx={r}
          cy={r}
          r={ringR}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={r}
          cy={r}
          r={ringR}
          fill="none"
          stroke="rgba(255,255,255,0.72)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform={`rotate(-90 ${r} ${r})`}
        />

        {normalizedSlices.length > 0 ? (
          <g opacity={0.9}>
            {(() => {
              let acc = 0
              return normalizedSlices.map((sli) => {
                const w = (sli.weight ?? 1) / totalWeight
                const a0 = acc * 2 * Math.PI
                const a1 = (acc + w) * 2 * Math.PI
                acc += w

                const inner = ringR - strokeWidth * 0.55
                const outer = ringR + strokeWidth * 0.55
                const fill =
                  sli.status === 'complete'
                    ? 'rgba(16,185,129,0.55)'
                    : sli.status === 'running'
                      ? 'rgba(59,130,246,0.45)'
                      : sli.status === 'blocked'
                        ? 'rgba(245,158,11,0.5)'
                        : sli.status === 'failed'
                          ? 'rgba(239,68,68,0.5)'
                          : 'rgba(255,255,255,0.16)'

                return (
                  <path
                    key={sli.id}
                    d={arcPath(r, r, outer, inner, a0, a1)}
                    fill={fill}
                    stroke="rgba(0,0,0,0.25)"
                    strokeWidth={1}
                  />
                )
              })
            })()}
          </g>
        ) : null}

        <g>
          <circle cx={arrow.x} cy={arrow.y} r={4.2} fill="rgba(255,255,255,0.92)" />
          <circle cx={arrow.x} cy={arrow.y} r={7.4} fill="rgba(255,255,255,0.12)" />
        </g>
      </svg>

      <div className="absolute inset-0 grid place-items-center">
        <div className="flex flex-col items-center gap-0.5">
          <div className="text-xs text-white/60">{label ?? 'Task'}</div>
          <div className="text-lg font-semibold text-white">{Math.round(p * 100)}%</div>
        </div>
      </div>

      {optionDots.map((opt) => (
        <button
          key={opt.id}
          type="button"
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/18 border border-white/10 px-2 py-1 text-[11px] text-white/80"
          style={{ left: opt.x, top: opt.y }}
          title={opt.hint ?? opt.label}
          onClick={() => onOptionClick?.(opt.id)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
