import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from 'recharts'
import {
  AlertTriangle, TrendingUp, Coffee, ShoppingBag, CheckCircle,
  Calendar, Sparkles, Target, ArrowLeft, ArrowRight, ChevronDown, ChevronUp,
  Upload, Lightbulb, TrendingDown, DollarSign
} from 'lucide-react'
import { catHe } from '../utils/financialAnalyzer'

const fmt = (n) => `₪${Number(n).toLocaleString('he-IL', { maximumFractionDigits: 0 })}`

const ICONS = {
  AlertTriangle, TrendingUp, Coffee, ShoppingBag, CheckCircle,
  Calendar, Sparkles, Target, Lightbulb, TrendingDown, DollarSign
}

function ScoreRing({ score, color, rating }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg width="144" height="144" viewBox="0 0 144 144">
        <circle cx="72" cy="72" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <motion.circle cx="72" cy="72" r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circumference} transform="rotate(-90 72 72)"
          initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }} />
        <motion.circle cx="72" cy="72" r={radius} fill="none" stroke={color} strokeWidth="3"
          strokeLinecap="round" strokeDasharray={circumference} transform="rotate(-90 72 72)"
          style={{ filter: 'blur(4px)', opacity: 0.4 }}
          initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }} />
      </svg>
      <div className="absolute text-center">
        <motion.div className="text-3xl font-black" style={{ color, letterSpacing: '-0.04em' }}
          initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, type: 'spring' }}>
          {score}
        </motion.div>
        <div className="text-xs font-medium" style={{ color: '#475569' }}>{rating}</div>
      </div>
    </div>
  )
}

function InsightCard({ insight, index }) {
  const [expanded, setExpanded] = useState(false)
  const Icon = ICONS[insight.icon] || Lightbulb

  const typeStyles = {
    warning: { bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.2)' },
    alert:   { bg: 'rgba(244,63,94,0.06)',  border: 'rgba(244,63,94,0.2)' },
    tip:     { bg: 'rgba(212,175,55,0.06)', border: 'rgba(212,175,55,0.2)' },
    success: { bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.2)' },
  }
  const styles = typeStyles[insight.type] || typeStyles.tip

  return (
    <motion.div className="rounded-2xl p-5 cursor-pointer transition-all duration-200"
      style={{ background: styles.bg, border: `1px solid ${styles.border}`, backdropFilter: 'blur(20px)' }}
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      onClick={() => setExpanded(!expanded)}
      whileHover={{ y: -2 }}>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${insight.color}15`, border: `1px solid ${insight.color}25` }}>
          <Icon size={18} style={{ color: insight.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="font-bold text-sm" style={{ color: '#F1F5F9' }}>{insight.title}</h4>
            <div className="flex items-center gap-2 flex-shrink-0">
              {insight.saving > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                  חיסכון {fmt(insight.saving)}
                </span>
              )}
              {expanded ? <ChevronUp size={14} style={{ color: '#475569' }} /> : <ChevronDown size={14} style={{ color: '#475569' }} />}
            </div>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>{insight.message}</p>

          <AnimatePresence>
            {expanded && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                <div className="mt-3 pt-3 flex items-start gap-2"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <ArrowLeft size={14} style={{ color: insight.color, flexShrink: 0, marginTop: 2 }} />
                  <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>{insight.action}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

function PredictionCard({ cat }) {
  const isUp = cat.change > 0
  return (
    <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
      <span className="text-xl">{cat.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate" style={{ color: '#CBD5E1' }}>{cat.nameHe || catHe(cat.name)}</div>
        <div className="text-xs" style={{ color: '#475569' }}>{fmt(cat.current)} ← {fmt(cat.predicted)}</div>
      </div>
      <div className="flex items-center gap-1 text-xs font-bold"
        style={{ color: isUp ? '#F43F5E' : '#10B981' }}>
        {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {Math.abs(cat.change).toFixed(1)}%
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-strong rounded-xl px-3 py-2 text-xs" dir="rtl">
      <p className="font-semibold mb-1" style={{ color: '#D4AF37' }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ color: '#94A3B8' }}>
          {p.name}: <span style={{ color: '#F1F5F9', fontWeight: 600 }}>₪{Number(p.value).toFixed(0)}</span>
        </div>
      ))}
    </div>
  )
}

export default function InsightsScreen({ data, onUpload }) {
  const d = data

  if (!d) return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <p style={{ color: '#475569' }}>לא נטענו נתונים.</p>
      <button onClick={onUpload} className="btn-gold px-6 py-3 rounded-xl flex items-center gap-2">
        <Upload size={16} /> העלה קובץ
      </button>
    </div>
  )

  const { insights, predictions, score } = d
  const predictionBarData = [
    { name: 'החודש',      value: Math.round(predictions.currentTotal),    fill: '#D4AF37' },
    { name: 'תחזית',      value: Math.round(predictions.nextMonthTotal),   fill: '#0EA5E9' },
    { name: 'יעד תקציב', value: Math.round(predictions.budgetSuggestion), fill: '#10B981' },
  ]

  return (
    <div className="screen-scroll">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* כותרת */}
        <motion.div className="mb-8" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} style={{ color: '#D4AF37' }} />
            <span className="text-sm font-medium" style={{ color: '#D4AF37' }}>ניתוח מבוסס AI</span>
          </div>
          <h1 className="text-3xl font-extrabold" style={{ color: '#F1F5F9', letterSpacing: '-0.02em' }}>
            תובנות <span className="gold-text">חכמות</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: '#475569' }}>
            המלצות מותאמות אישית בהתבסס על ההוצאות שלך — {d.monthName}
          </p>
        </motion.div>

        {/* שורה עליונה: ציון + תחזית */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

          {/* ציון בריאות פיננסית */}
          <motion.div className="glass rounded-2xl p-6 flex flex-col items-center text-center"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#475569' }}>
              ציון בריאות פיננסית
            </p>
            <ScoreRing score={score.score} color={score.color} rating={score.rating} />
            <p className="text-sm mt-4 leading-relaxed" style={{ color: '#64748B' }}>{score.message}</p>
            <div className="grid grid-cols-3 gap-2 w-full mt-5">
              {[
                { label: 'הוצאות', val: `₪${(d.totalSpending / 1000).toFixed(1)}k` },
                { label: 'קטגוריות', val: d.uniqueCategories },
                { label: 'עסקאות', val: d.transactionCount },
              ].map(({ label, val }) => (
                <div key={label} className="glass rounded-xl py-2 text-center">
                  <div className="text-sm font-bold" style={{ color: '#F1F5F9' }}>{val}</div>
                  <div className="text-xs" style={{ color: '#334155' }}>{label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* תחזית חודשית */}
          <motion.div className="glass rounded-2xl p-6 lg:col-span-2"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#475569' }}>תחזית חודשית</p>
                <h3 className="font-bold text-lg" style={{ color: '#F1F5F9' }}>תחזית לחודש הבא</h3>
              </div>
              <div className="glass-gold rounded-xl px-3 py-2 text-center">
                <div className="text-xl font-extrabold gold-text">{fmt(predictions.nextMonthTotal)}</div>
                <div className="text-xs" style={{ color: '#64748B' }}>חזוי</div>
              </div>
            </div>

            <div dir="ltr">
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={predictionBarData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: '#334155', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#334155', fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `₪${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {predictionBarData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} opacity={0.9} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="glass rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Target size={14} style={{ color: '#10B981' }} />
                  <span className="text-xs" style={{ color: '#475569' }}>פוטנציאל חיסכון</span>
                </div>
                <div className="text-lg font-bold" style={{ color: '#10B981' }}>{fmt(predictions.potentialSaving)}</div>
              </div>
              <div className="glass rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign size={14} style={{ color: '#0EA5E9' }} />
                  <span className="text-xs" style={{ color: '#475569' }}>יעד תקציב</span>
                </div>
                <div className="text-lg font-bold" style={{ color: '#0EA5E9' }}>{fmt(predictions.budgetSuggestion)}</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* תובנות + תחזית קטגוריות */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* כרטיסי תובנות */}
          <div className="lg:col-span-3 space-y-3">
            <motion.div className="flex items-center gap-2 mb-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <Lightbulb size={16} style={{ color: '#D4AF37' }} />
              <h3 className="font-bold" style={{ color: '#F1F5F9' }}>
                {insights.length} תובנות מותאמות אישית
              </h3>
            </motion.div>
            {insights.map((insight, i) => (
              <InsightCard key={insight.id} insight={insight} index={i} />
            ))}
          </div>

          {/* תחזית קטגוריות */}
          <div className="lg:col-span-2">
            <motion.div className="flex items-center gap-2 mb-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
              <TrendingUp size={16} style={{ color: '#0EA5E9' }} />
              <h3 className="font-bold" style={{ color: '#F1F5F9' }}>תחזית קטגוריות</h3>
            </motion.div>
            <div className="space-y-2">
              {predictions.categoryPredictions.map((cat, i) => (
                <motion.div key={cat.name}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}>
                  <PredictionCard cat={cat} />
                </motion.div>
              ))}
            </div>

            {/* עוזר AI */}
            <motion.div className="glass-gold rounded-2xl p-5 mt-6"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #D4AF37, #F5C842)' }}>
                  <Sparkles size={14} style={{ color: '#080B14' }} />
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: '#F1F5F9' }}>עוזר פיננסי AI</div>
                  <div className="text-xs" style={{ color: '#64748B' }}>שאל כל דבר על ההוצאות שלך</div>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  'איך אוכל לחסוך ₪500 בחודש הבא?',
                  "מה הסיכון הגדול ביותר בהוצאות שלי?",
                  'הצע לי תוכנית תקציב חודשית',
                ].map((q) => (
                  <button key={q} className="w-full text-right px-3 py-2 rounded-xl text-xs transition-all duration-200"
                    style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)', color: '#94A3B8' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
                    onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}>
                    "{q}"
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

      </div>
    </div>
  )
}
