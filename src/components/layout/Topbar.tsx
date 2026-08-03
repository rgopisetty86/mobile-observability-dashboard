import { useTranslation } from 'react-i18next'

interface TopbarProps {
  title: string
  range: string
}

export default function Topbar({ title, range }: TopbarProps) {
  const { t } = useTranslation()
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="crumb">
          <span>{t('topbar.observability')}</span>
          <svg className="ico" viewBox="0 0 24 24" style={{ width: 14, height: 14 }}>
            <path d="m9 18 6-6-6-6" />
          </svg>
          <span className="crumb-current">{title}</span>
        </div>
      </div>
      <div className="topbar-right">
        <span className="range-pill">{range}</span>
        <span className="live-pill">
          <span className="live-dot" />
          {t('topbar.live')}
        </span>
      </div>
    </header>
  )
}
