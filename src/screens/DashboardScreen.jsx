import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Line
} from 'recharts'
import {
  TrendingUp, DollarSign, ShoppingBag, Calendar,
  BarChart2, Upload, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import { analyzeFinances, CATEGORY_COLORS, catHe } from '../utils/financialAnalyzer'
import { DEMO_DATA } from '../utils/excelParser'

const fmt = (n) => `₪${Number(n).toLocaleString('he-IL', { maximumFractionDigits: 0 })}`
const fmtDec = (n) => `₪${Number(n).toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function StatCard({ label, value, sub, icon: Icon, color, trend, delay = 0 }) {
  return (
    <motion.div className="stat-card"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
          <Icon size={18} style={{ color }} />
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg"
            style={{ background: trend >= 0 ? 'rgba(244,63,94,0.1)' : 'rgba(16,185,129,0.1)', color: trend >= 0 ? '#F43F5E' : '#10B981' }}>
            {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-extrabold mb-1" style={{ color: '#F1F5F9', letterSpacing: '-0.03em' }}>{value}</div>
      <div className="text-xs font-medium" style={{ color: '#475569' }}>{label}</div>
      {sub && <div className="text-xs mt-1" style={{ color: '#334155' }}>{sub}</div>}
    </motion.div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-strong rounded-xl px-4 py-3 text-sm" dir="rtl">
      <p className="font-semibold mb-2" style={{ color: '#D4AF37' }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span style={{ color: '#94A3B8' }}>{p.name}: </span>
          <span style={{ color: '#F1F5F9', fontWeight: 600 }}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="glass-strong rounded-xl px-4 py-3 text-sm" dir="rtl">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.payload.color }} />
        <span style={{ color: '#F1F5F9', fontWeight: 600 }}>{d.payload.nameHe || d.name}</span>
      </div>
      <div style={{ color: '#D4AF37', fontWeight: 700 }}>{fmt(d.value)}</div>
      <div style={{ color: '#64748B', fontSize: 11 }}>{d.payload.pct?.toFixed(1)}% מהסך הכולל</div>
    </div>
  )
}

function CategoryBar({ cat, max }) {
  const pct = max > 0 ? (cat.total / max) * 100 : 0
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-base w-6 text-center">{cat.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium truncate" style={{ color: '#CBD5E1' }}>{cat.nameHe || catHe(cat.name)}</span>
          <span className="text-sm font-bold mr-3 flex-shrink-0" style={{ color: '#F1F5F9' }}>{fmt(cat.total)}</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${cat.color}, ${cat.color}99)` }}
            initial={{ width: 0 }} animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }} />
        </div>
      </div>
      <span className="text-xs w-10 text-left flex-shrink-0" style={{ color: '#475569' }}>{cat.pct?.toFixed(0)}%</span>
    </div>
  )
}

function HeatmapRow({ data }) {
  return (
    <div className="flex items-center gap-2" dir="ltr">
      {data.map((d) => (
        <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full rounded-lg transition-all" style={{
            height: 36,
            background: d.intensity > 0 ? `rgba(212,175,55,${0.1 + d.intensity * 0.7})` : 'rgba(255,255,255,0.03)',
            border: `1px solid rgba(212,175,55,${0.05 + d.intensity * 0.2})`,
          }} title={`${d.day}: ${fmt(d.value)}`} />
          <span className="text-xs" style={{ color: '#334155' }}>{d.day}</span>
        </div>
      ))}
    </div>
  )
}

export default function DashboardScreen({ data, onUpload }) {
  const d = data || analyzeFinances(DEMO_DATA)
  const [activeCategory, setActiveCategory] = useState(null)

  if (!d) return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <p style={{ color: '#475569' }}>לא נטענו נתונים עדיין.</p>
      <button onClick={onUpload} className="btn-gold px-6 py-3 rounded-xl flex items-center gap-2">
        <Upload size={16} /> העלה קובץ
      </button>
    </div>
  )

  const maxCategory = d.categoryData[0]?.total || 1

  return (
    <div className="screen-scroll">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* כותרת */}
        <motion.div className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: '#475569' }}>סקירה פיננסית</p>
            <h1 className="text-3xl font-extrabold" style={{ color: '#F1F5F9', letterSpacing: '-0.02em' }}>
              לוח בקרה — <span className="gold-text">{d.monthName}</span>
            </h1>
          </div>
          <button onClick={onUpload} className="btn-glass px-4 py-2 rounded-xl text-sm flex items-center gap-2">
            <Upload size={14} /> קובץ חדש
          </button>
        </motion.div>

        {/* כרטיסי סטטיסטיקה */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="סה״כ הוצאות" value={fmt(d.totalSpending)}
            sub={`${d.transactionCount} עסקאות`} icon={DollarSign} color="#D4AF37" delay={0} />
          <StatCard label="ממוצע יומי" value={fmt(d.avgDailySpending)}
            sub="ליום פעיל" icon={Calendar} color="#0EA5E9" delay={0.05} />
          <StatCard label="קטגוריה מובילה" value={catHe(d.topCategory?.name) || '—'}
            sub={d.topCategory ? fmt(d.topCategory.total) : ''} icon={ShoppingBag} color="#8B5CF6" delay={0.1} />
          <StatCard label="עסקה ממוצעת" value={fmtDec(d.avgTransaction)}
            sub={`${d.uniqueCategories} קטגוריות`} icon={BarChart2} color="#10B981" delay={0.15} />
        </div>

        {/* שורה ראשית של גרפים */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

          {/* מגמת הוצאות */}
          <motion.div className="chart-container lg:col-span-2"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold" style={{ color: '#F1F5F9' }}>מגמת הוצאות יומית</h3>
                <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
                  {d.monthName} • {d.dailyData.length} ימים במעקב
                </p>
              </div>
              <TrendingUp size={18} style={{ color: '#D4AF37' }} />
            </div>
            <div dir="ltr">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={d.dailyData} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                  <defs>
                    <linearGradient id="areaGold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#D4AF37" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tick={{ fill: '#334155', fontSize: 11 }} axisLine={false} tickLine={false}
                    interval={Math.floor(d.dailyData.length / 6)} />
                  <YAxis tick={{ fill: '#334155', fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `₪${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="total" name="הוצאות" stroke="#D4AF37" strokeWidth={2}
                    fill="url(#areaGold)" dot={false} activeDot={{ r: 5, fill: '#D4AF37', strokeWidth: 0 }} />
                  {d.movingAvg && (
                    <Line data={d.movingAvg} type="monotone" dataKey="ma" name="ממוצע 7 ימים"
                      stroke="#0EA5E9" strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* עוגת קטגוריות */}
          <motion.div className="chart-container"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <h3 className="font-bold mb-4" style={{ color: '#F1F5F9' }}>לפי קטגוריה</h3>
            <div dir="ltr">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={d.categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                    paddingAngle={3} dataKey="total" nameKey="nameHe"
                    onMouseEnter={(_, i) => setActiveCategory(i)}
                    onMouseLeave={() => setActiveCategory(null)}>
                    {d.categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.color}
                        opacity={activeCategory === null || activeCategory === i ? 1 : 0.4}
                        stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 mt-2">
              {d.categoryData.slice(0, 4).map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                  <span className="text-xs flex-1" style={{ color: '#64748B' }}>{c.nameHe || catHe(c.name)}</span>
                  <span className="text-xs font-semibold" style={{ color: '#94A3B8' }}>{c.pct.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* שורה שנייה */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

          {/* פירוט קטגוריות */}
          <motion.div className="chart-container"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h3 className="font-bold mb-5" style={{ color: '#F1F5F9' }}>פירוט קטגוריות</h3>
            <div className="divide-y divide-white/[0.04]">
              {d.categoryData.map((cat) => (
                <CategoryBar key={cat.name} cat={cat} max={maxCategory} />
              ))}
            </div>
          </motion.div>

          {/* השוואה שבועית */}
          <motion.div className="chart-container"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <h3 className="font-bold mb-5" style={{ color: '#F1F5F9' }}>השוואה שבועית</h3>
            <div dir="ltr">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={d.weeklyData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D4AF37" />
                      <stop offset="100%" stopColor="#A8892B" />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" tick={{ fill: '#334155', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#334155', fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `₪${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total" name="הוצאות" fill="url(#barGold)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* מפת חום ימי שבוע */}
          <motion.div className="chart-container"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h3 className="font-bold mb-2" style={{ color: '#F1F5F9' }}>הוצאות לפי יום בשבוע</h3>
            <p className="text-xs mb-5" style={{ color: '#475569' }}>עצימות = סה״כ הוצאה</p>
            <HeatmapRow data={d.heatmapData} />
            <div className="mt-5 space-y-2">
              {d.weekdayData
                .filter(d => d.total > 0)
                .sort((a, b) => b.total - a.total)
                .slice(0, 3)
                .map((day, i) => (
                  <div key={day.name} className="flex items-center justify-between text-sm">
                    <span style={{ color: '#64748B' }}>
                      {i === 0 ? '🔥' : i === 1 ? '📊' : '📌'} יום {day.name}
                    </span>
                    <span style={{ color: '#94A3B8', fontWeight: 600 }}>{fmt(day.total)}</span>
                  </div>
                ))}
            </div>
          </motion.div>
        </div>

        {/* עסקאות אחרונות */}
        <motion.div className="chart-container"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <h3 className="font-bold mb-5" style={{ color: '#F1F5F9' }}>עסקאות אחרונות</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {['תאריך', 'תיאור', 'קטגוריה', 'סכום'].map(h => (
                    <th key={h} className="text-right pb-3 font-semibold text-xs uppercase tracking-wider pl-4"
                      style={{ color: '#334155', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.expenses
                  .slice().sort((a, b) => b.dateStr.localeCompare(a.dateStr)).slice(0, 8)
                  .map((exp, i) => (
                    <motion.tr key={exp.id}
                      initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.03 }}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td className="py-3 pl-4 font-mono text-xs" style={{ color: '#475569' }}>{exp.dateStr}</td>
                      <td className="py-3 pl-4 font-medium" style={{ color: '#CBD5E1' }}>{exp.description}</td>
                      <td className="py-3 pl-4">
                        <span className="px-2 py-0.5 rounded-lg text-xs font-medium"
                          style={{
                            background: `${CATEGORY_COLORS[exp.category] || '#64748B'}15`,
                            color: CATEGORY_COLORS[exp.category] || '#64748B',
                            border: `1px solid ${CATEGORY_COLORS[exp.category] || '#64748B'}25`,
                          }}>
                          {catHe(exp.category)}
                        </span>
                      </td>
                      <td className="py-3 text-left font-bold" style={{ color: '#F1F5F9' }}>{fmtDec(exp.amount)}</td>
                    </motion.tr>
                  ))}
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
