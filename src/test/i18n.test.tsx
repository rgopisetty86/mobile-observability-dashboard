// @vitest-environment jsdom
/**
 * UAT — Language Translation Tests
 *
 * Covers:
 *  1. Topbar language selector renders with current language
 *  2. Switching to each language (FR / DE / IT / ES) updates key UI strings
 *  3. Switching back to EN restores original strings
 *  4. Language persists in localStorage
 *  5. Dropdown opens / closes correctly
 *  6. Active language is highlighted in the dropdown
 *  7. Dashboard titles translate across all 5 sections per language
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import App from '../App'
import i18n from '../lib/i18n'

// ── Mock localStorage ────────────────────────────────────────────────────────
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem:     (k: string) => store[k] ?? null,
    setItem:     (k: string, v: string) => { store[k] = v },
    removeItem:  (k: string) => { delete store[k] },
    clear:       () => { store = {} },
  }
})()
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true })

// ── Reset state before each test ─────────────────────────────────────────────
beforeEach(async () => {
  localStorageMock.clear()
  await act(async () => { await i18n.changeLanguage('en') })
})

afterEach(() => {
  localStorageMock.clear()
})

// ── 1. Language selector renders ────────────────────────────────────────────

describe('Language selector — Topbar rendering', () => {
  it('renders the language selector button in the topbar', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument()
  })

  it('shows the current language flag and code (EN by default)', () => {
    render(<App />)
    const btn = screen.getByRole('button', { name: /select language/i })
    expect(btn).toHaveTextContent('EN')
    expect(btn).toHaveTextContent('🇬🇧')
  })

  it('dropdown is hidden by default', () => {
    render(<App />)
    expect(screen.queryByText('English')).not.toBeInTheDocument()
  })

  it('opens dropdown on button click and lists all 5 languages', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /select language/i }))
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('Français')).toBeInTheDocument()
    expect(screen.getByText('Deutsch')).toBeInTheDocument()
    expect(screen.getByText('Italiano')).toBeInTheDocument()
    expect(screen.getByText('Español')).toBeInTheDocument()
  })

  it('closes dropdown when clicking outside', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /select language/i }))
    expect(screen.getByText('English')).toBeInTheDocument()
    fireEvent.mouseDown(document.body)
    await waitFor(() => {
      expect(screen.queryByText('Français')).not.toBeInTheDocument()
    })
  })

  it('closes dropdown when the toggle button is clicked again', async () => {
    render(<App />)
    const btn = screen.getByRole('button', { name: /select language/i })
    fireEvent.click(btn)
    expect(screen.getByText('English')).toBeInTheDocument()
    fireEvent.click(btn)
    await waitFor(() => {
      expect(screen.queryByText('Français')).not.toBeInTheDocument()
    })
  })

  it('active language option has the "active" class', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /select language/i }))
    expect(screen.getByRole('button', { name: /english/i })).toHaveClass('active')
  })
})

// ── 2. French translations ─────────────────────────────────────────────────

describe('Language selector — French (FR)', () => {
  it('switches to French and translates the SRE dashboard title', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /select language/i }))
    fireEvent.click(screen.getByText('Français'))
    await waitFor(() => {
      expect(screen.getByText("Vue d'ensemble de la santé du service")).toBeInTheDocument()
    })
  })

  it('translates the topbar live indicator', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /select language/i }))
    fireEvent.click(screen.getByText('Français'))
    await waitFor(() => expect(screen.getByText('en direct')).toBeInTheDocument())
  })

  it('translates the topbar Observability breadcrumb', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /select language/i }))
    fireEvent.click(screen.getByText('Français'))
    await waitFor(() => expect(screen.getByText('Observabilité')).toBeInTheDocument())
  })

  it('updates the topbar button to show FR flag', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /select language/i }))
    fireEvent.click(screen.getByText('Français'))
    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /select language/i })
      expect(btn).toHaveTextContent('FR')
      expect(btn).toHaveTextContent('🇫🇷')
    })
  })

  it('translates the Engineering dashboard title (key 2)', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /select language/i }))
    fireEvent.click(screen.getByText('Français'))
    fireEvent.keyDown(window, { key: '2' })
    await waitFor(() => {
      expect(screen.getByText('Explorateur de crashs')).toBeInTheDocument()
    })
  })
})

// ── 3. German translations ─────────────────────────────────────────────────

describe('Language selector — German (DE)', () => {
  it('switches to German and translates the SRE dashboard title', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /select language/i }))
    fireEvent.click(screen.getByText('Deutsch'))
    await waitFor(() => {
      expect(screen.getByText('Dienst-Gesundheitsübersicht')).toBeInTheDocument()
    })
  })

  it('translates the SRE dashboard subtitle', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /select language/i }))
    fireEvent.click(screen.getByText('Deutsch'))
    await waitFor(() => expect(screen.getByText('Echtzeit-Ansicht für Bereitschaft · Auto-Aktualisierung 30s')).toBeInTheDocument())
  })

  it('updates topbar button to DE', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /select language/i }))
    fireEvent.click(screen.getByText('Deutsch'))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /select language/i })).toHaveTextContent('DE')
    })
  })

  it('translates the Security dashboard title (key 4)', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /select language/i }))
    fireEvent.click(screen.getByText('Deutsch'))
    fireEvent.keyDown(window, { key: '4' })
    await waitFor(() => {
      expect(screen.getByText('Bedrohungserkennung')).toBeInTheDocument()
    })
  })
})

// ── 4. Italian translations ────────────────────────────────────────────────

describe('Language selector — Italian (IT)', () => {
  it('switches to Italian and translates the SRE dashboard title', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /select language/i }))
    fireEvent.click(screen.getByText('Italiano'))
    await waitFor(() => {
      expect(screen.getByText('Panoramica salute del servizio')).toBeInTheDocument()
    })
  })

  it('translates the topbar live indicator', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /select language/i }))
    fireEvent.click(screen.getByText('Italiano'))
    await waitFor(() => expect(screen.getByText('in diretta')).toBeInTheDocument())
  })

  it('updates topbar button to IT', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /select language/i }))
    fireEvent.click(screen.getByText('Italiano'))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /select language/i })).toHaveTextContent('IT')
    })
  })

  it('translates the Executive dashboard title (key 5)', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /select language/i }))
    fireEvent.click(screen.getByText('Italiano'))
    fireEvent.keyDown(window, { key: '5' })
    await waitFor(() => {
      expect(screen.getByText('Riepilogo esecutivo')).toBeInTheDocument()
    })
  })
})

// ── 5. Spanish translations ────────────────────────────────────────────────

describe('Language selector — Spanish (ES)', () => {
  it('switches to Spanish and translates the SRE dashboard title', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /select language/i }))
    fireEvent.click(screen.getByText('Español'))
    await waitFor(() => {
      expect(screen.getByText('Resumen de salud del servicio')).toBeInTheDocument()
    })
  })

  it('translates the topbar live indicator', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /select language/i }))
    fireEvent.click(screen.getByText('Español'))
    await waitFor(() => expect(screen.getByText('en vivo')).toBeInTheDocument())
  })

  it('updates topbar button to ES', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /select language/i }))
    fireEvent.click(screen.getByText('Español'))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /select language/i })).toHaveTextContent('ES')
    })
  })

  it('translates the Product dashboard title (key 3)', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /select language/i }))
    fireEvent.click(screen.getByText('Español'))
    fireEvent.keyDown(window, { key: '3' })
    await waitFor(() => {
      expect(screen.getByText('Estrella del norte e inscripción')).toBeInTheDocument()
    })
  })
})

// ── 6. Switching back to English ───────────────────────────────────────────

describe('Language selector — switching back to English', () => {
  it('restores EN strings after FR → EN', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /select language/i }))
    fireEvent.click(screen.getByText('Français'))
    await waitFor(() => {
      expect(screen.getByText("Vue d'ensemble de la santé du service")).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /select language/i }))
    fireEvent.click(screen.getByText('English'))
    await waitFor(() => {
      expect(screen.getByText('Service health overview')).toBeInTheDocument()
    })
  })

  it('restores EN strings after DE → EN', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /select language/i }))
    fireEvent.click(screen.getByText('Deutsch'))
    await waitFor(() => expect(screen.getByText('Dienst-Gesundheitsübersicht')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /select language/i }))
    fireEvent.click(screen.getByText('English'))
    await waitFor(() => expect(screen.getByText('Service health overview')).toBeInTheDocument())
  })
})

// ── 7. localStorage persistence ───────────────────────────────────────────

describe('Language selector — localStorage persistence', () => {
  it('saves DE to localStorage when German is selected', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /select language/i }))
    fireEvent.click(screen.getByText('Deutsch'))
    await waitFor(() => {
      expect(localStorageMock.getItem('obs-lang')).toBe('de')
    })
  })

  it('saves ES to localStorage when Spanish is selected', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /select language/i }))
    fireEvent.click(screen.getByText('Español'))
    await waitFor(() => {
      expect(localStorageMock.getItem('obs-lang')).toBe('es')
    })
  })

  it('saves IT to localStorage when Italian is selected', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /select language/i }))
    fireEvent.click(screen.getByText('Italiano'))
    await waitFor(() => {
      expect(localStorageMock.getItem('obs-lang')).toBe('it')
    })
  })

  it('saves FR to localStorage when French is selected', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /select language/i }))
    fireEvent.click(screen.getByText('Français'))
    await waitFor(() => {
      expect(localStorageMock.getItem('obs-lang')).toBe('fr')
    })
  })
})

// ── 8. All dashboard titles per language (keyboard navigation) ────────────

describe('Language selector — all dashboard titles', () => {
  const sections = [
    { key: '2', label: 'Engineering',
      fr: 'Explorateur de crashs', de: 'Absturz-Explorer',
      it: 'Esplora crash',         es: 'Explorador de fallos' },
    { key: '3', label: 'Product',
      fr: 'Étoile du nord & inscription', de: 'Nordstern & Registrierung',
      it: 'Stella polare & iscrizione',   es: 'Estrella del norte e inscripción' },
    { key: '4', label: 'Security',
      fr: 'Détection des menaces', de: 'Bedrohungserkennung',
      it: 'Rilevamento minacce',   es: 'Detección de amenazas' },
    { key: '5', label: 'Executive',
      fr: 'Résumé exécutif', de: 'Führungszusammenfassung',
      it: 'Riepilogo esecutivo',   es: 'Resumen ejecutivo' },
  ]

  const langs = [
    { name: 'Français', field: 'fr' as const, code: 'FR' },
    { name: 'Deutsch',  field: 'de' as const, code: 'DE' },
    { name: 'Italiano', field: 'it' as const, code: 'IT' },
    { name: 'Español',  field: 'es' as const, code: 'ES' },
  ]

  for (const lang of langs) {
    for (const section of sections) {
      it(`${lang.code}: key ${section.key} (${section.label}) shows translated title`, async () => {
        render(<App />)
        fireEvent.click(screen.getByRole('button', { name: /select language/i }))
        fireEvent.click(screen.getByText(lang.name))
        fireEvent.keyDown(window, { key: section.key })
        await waitFor(() => {
          expect(screen.getByText(section[lang.field])).toBeInTheDocument()
        })
      })
    }
  }
})
