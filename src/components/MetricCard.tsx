import * as React from 'react'

type Accent = 'green' | 'blue' | 'purple' | 'red' | 'orange'

type MetricCardProps = {
  title: string
  value: number | string
  icon?: React.ReactNode
  color?: Accent
  description?: string
  className?: string
}

const ACCENT_STYLES: Record<Accent, { bg: string; text: string }> = {
  green: { bg: 'bg-green-600/10', text: 'text-green-500' },
  blue: { bg: 'bg-blue-600/10', text: 'text-blue-500' },
  purple: { bg: 'bg-purple-600/10', text: 'text-purple-500' },
  red: { bg: 'bg-red-600/10', text: 'text-red-500' },
  orange: { bg: 'bg-orange-600/10', text: 'text-orange-500' }
}

export default function MetricCard({
  title,
  value,
  icon,
  color,
  description,
  className = ''
}: MetricCardProps) {
  const accent = color ? ACCENT_STYLES[color] : { bg: 'bg-primary-600/10', text: 'text-primary-500' }
  const ariaLabel = `${title}: ${value}${description ? ' — ' + description : ''}`

  return (
    <div
      className={`bg-card border border-slate-700 rounded-2xl p-4 flex flex-col justify-between shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 ${className}`}
      role="group"
      aria-label={ariaLabel}
      tabIndex={0}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {icon ? (
            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${accent.bg} ${accent.text}`}>
              {/* user-provided icon */}
              <span className="sr-only">{title} icon</span>
              {icon}
            </div>
          ) : (
            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${accent.bg} ${accent.text}`}>
              <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          )}
          <div>
            <div className="text-sm text-text-medium">{title}</div>
            {description ? <div className="text-xs text-text-medium/80">{description}</div> : null}
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl font-bold text-text-high transition-all duration-300">{value}</div>
      </div>

      {/* Sparkline placeholder (static) */}
      <div className="mt-3">
        <svg aria-hidden="true" className={`w-full h-8 ${accent.text}`} viewBox="0 0 100 24" preserveAspectRatio="none">
          <polyline
            points="0,18 10,14 20,16 30,10 40,12 50,8 60,11 70,7 80,9 90,6 100,8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  )
}