import { motion } from 'framer-motion'
import { LayoutDashboard, Upload, Sparkles, Database, LogOut } from 'lucide-react'

const TABS = [
  { id: 'upload',    label: 'העלאה',       icon: Upload },
  { id: 'dashboard', label: 'לוח בקרה',    icon: LayoutDashboard },
  { id: 'insights',  label: 'תובנות AI',   icon: Sparkles },
  { id: 'erd',       label: 'מודל נתונים', icon: Database },
]

export default function Navigation({ currentScreen, onNavigate, hasData, user, onLogout }) {
  return (
    <header className="glass border-b border-white/[0.06] px-6 py-0 flex items-center justify-between"
      style={{ height: 64, minHeight: 64 }}>

      {/* Logo */}
      <button onClick={() => onNavigate('welcome')} className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #D4AF37, #F5C842)' }}>
          <span className="text-black font-black text-sm">F</span>
        </div>
        <span className="font-bold text-base" style={{ color: '#F1F5F9' }}>
          פיננסי<span className="gold-text">IQ</span>
        </span>
      </button>

      {/* Tabs */}
      <nav className="flex items-center gap-1">
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = currentScreen === tab.id
          const isDisabled = !hasData && (tab.id === 'dashboard' || tab.id === 'insights')
          return (
            <button key={tab.id}
              onClick={() => !isDisabled && onNavigate(tab.id)}
              disabled={isDisabled}
              className={`nav-tab flex items-center gap-2 ${isActive ? 'active' : ''} ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}>
              <Icon size={15} />
              <span className="hidden sm:inline">{tab.label}</span>
              {isActive && (
                <motion.div layoutId="nav-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: 'linear-gradient(90deg, #D4AF37, #F5C842)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
              )}
            </button>
          )
        })}
      </nav>

      {/* User + status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium" style={{ color: '#34D399' }}>פעיל</span>
        </div>

        {user && (
          <div className="flex items-center gap-2">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37' }}>
              {user.initial}
            </div>
            <span className="text-sm hidden md:inline" style={{ color: '#94A3B8' }}>{user.name}</span>
            <button onClick={onLogout} title="יציאה"
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
              style={{ color: '#475569' }}
              onMouseEnter={e => e.currentTarget.style.color = '#F43F5E'}
              onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
