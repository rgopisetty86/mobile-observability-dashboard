interface TooltipEntry {
  dataKey: string
  name: string
  value: number
  color: string
}

interface ChartTooltipProps {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string
  formatter?: (value: number, name: string) => string
}

export function ChartTooltip({ active, payload, label, formatter }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-default)',
      borderRadius: 6,
      padding: '10px 12px',
      fontSize: 12,
    }}>
      {label && (
        <div style={{
          color: 'var(--text-secondary)',
          fontSize: 10,
          fontFamily: 'IBM Plex Mono, monospace',
          marginBottom: 6,
        }}>
          {label}
        </div>
      )}
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, fontFamily: 'IBM Plex Mono, monospace', fontSize: 11 }}>
          {p.name}: {formatter ? formatter(p.value, p.name) : p.value}
        </div>
      ))}
    </div>
  )
}
