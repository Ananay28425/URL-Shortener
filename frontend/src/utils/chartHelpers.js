/** Shared Recharts styling for dark dashboards (accent: --accent) */

export const CHART_MARGIN = { top: 8, right: 8, left: 0, bottom: 0 }

export const axisTick = {
  fill: 'rgba(255,255,255,0.45)',
  fontSize: 11,
}

export const axisLine = { stroke: 'rgba(255,255,255,0.08)' }

export const gridStroke = 'rgba(255,255,255,0.06)'

export const tooltipContentStyle = {
  background: 'rgba(5,5,5,0.94)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 12,
  boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
  color: '#fff',
}

export const tooltipLabelStyle = { color: 'rgba(255,255,255,0.55)', fontSize: 11 }

export const tooltipItemStyle = { color: '#fff', fontSize: 12 }

/** Unique SVG gradient ids when multiple charts mount */
export function chartGradientIds(prefix) {
  const safe = String(prefix || 'c').replace(/[^a-zA-Z0-9_-]/g, '')
  return {
    primary: `${safe}-grad-primary`,
    secondary: `${safe}-grad-secondary`,
  }
}

export const ACCENT = 'var(--accent)'
export const MUTED_LINE = 'rgba(255,255,255,0.55)'
