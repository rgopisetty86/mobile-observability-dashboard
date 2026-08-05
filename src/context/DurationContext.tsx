import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Section } from '../App'

export interface DurationOption {
  value: string   // internal key, e.g. '1h'
  label: string   // display label, e.g. 'Last 1h'
}

// Available durations per dashboard section
export const SECTION_DURATIONS: Record<Section, DurationOption[]> = {
  sre: [
    { value: '15m', label: 'Last 15m' },
    { value: '1h',  label: 'Last 1h'  },
    { value: '6h',  label: 'Last 6h'  },
    { value: '24h', label: 'Last 24h' },
    { value: '7d',  label: 'Last 7d'  },
  ],
  engineering: [
    { value: '1h',  label: 'Last 1h'  },
    { value: '6h',  label: 'Last 6h'  },
    { value: '24h', label: 'Last 24h' },
    { value: '7d',  label: 'Last 7d'  },
    { value: '30d', label: 'Last 30d' },
  ],
  product: [
    { value: '7d',  label: 'Last 7d'  },
    { value: '14d', label: 'Last 14d' },
    { value: '30d', label: 'Last 30d' },
    { value: '90d', label: 'Last 90d' },
  ],
  security: [
    { value: '1h',  label: 'Last 1h'  },
    { value: '6h',  label: 'Last 6h'  },
    { value: '24h', label: 'Last 24h' },
    { value: '7d',  label: 'Last 7d'  },
  ],
  executive: [
    { value: '30d', label: 'Last 30d' },
    { value: '90d', label: 'Last 90d' },
    { value: '6M',  label: 'Last 6M'  },
    { value: '1Y',  label: 'Last 1Y'  },
  ],
}

// Default selection per section (matches current static ranges)
const DEFAULTS: Record<Section, string> = {
  sre:         '1h',
  engineering: '24h',
  product:     '30d',
  security:    '24h',
  executive:   '30d',
}

interface DurationCtx {
  duration: Record<Section, string>
  setDuration: (section: Section, value: string) => void
  activeDuration: (section: Section) => DurationOption
}

export const DurationContext = createContext<DurationCtx>({
  duration:       DEFAULTS,
  setDuration:    () => {},
  activeDuration: (s) => SECTION_DURATIONS[s][0],
})

export function DurationProvider({ children }: { children: ReactNode }) {
  const [duration, setDurationState] = useState<Record<Section, string>>(DEFAULTS)

  const setDuration = (section: Section, value: string) => {
    setDurationState(prev => ({ ...prev, [section]: value }))
  }

  const activeDuration = (section: Section): DurationOption => {
    const val = duration[section]
    return SECTION_DURATIONS[section].find(o => o.value === val) ?? SECTION_DURATIONS[section][0]
  }

  return (
    <DurationContext.Provider value={{ duration, setDuration, activeDuration }}>
      {children}
    </DurationContext.Provider>
  )
}

export const useDuration = () => useContext(DurationContext)
