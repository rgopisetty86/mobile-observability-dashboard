import type { ReactNode } from 'react'

// Layout is no longer used — App.tsx renders the shell directly.
// Kept as a no-op wrapper to avoid breaking any potential future imports.
interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return <>{children}</>
}
