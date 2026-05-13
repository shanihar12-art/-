import { motion } from 'framer-motion'
import { ArrowLeft, TrendingUp, Shield, Zap } from 'lucide-react'

const Orb = ({ size, color, x, y, delay, duration = 10 }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      width: size, height: size,
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      left: x, top: y,
      filter: 'blur(60px)',
      opacity: 0.35,
    }}
    animate={{
      x: [0, 25, -15, 0],
      y: [0, -20, 25, 0],
      scale: [1, 1.08, 0.95, 1],
      opacity: [0.35, 0.5, 0.3, 0.35],
    }}
    transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
  />
)

const FloatingCard = ({ icon: Icon, label, value, color, delay, x, y }) => (
  <motion.div
    className="absolute glass-strong rounded-2xl px-4 py-3 flex items-center gap-3"
    style={{ left: x, top: y }}
    initial={{ opacity: 0, scale: 0.8, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
    transition={{
      opacity: { delay: delay + 0.5, duration: 0.6 },
      scale: { delay: delay + 0.5, duration: 0.6 },
      y: { delay: delay + 1, duration: 4, repeat: Infinity, ease: 'easeInOut' },
    }}
  >
    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
      <Icon size={16} style={{ color }} />
    </div>
    <div>
      <div className="text-xs font-medium" style={{ color: '#64748B' }}>{label}</div>
      <div className="text-sm font-bold" style={{ color: '#F1F5F9' }}>{value}</div>
    </div>
  </motion.div>
)

const Feature = ({ icon: Icon, text, delay }) => (
  <motion.div
    className="flex items-center gap-2"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.4 }}
  >
    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ background: 'rgba(212,175,55,0.15)' }}>
      <Icon size={11} style={{ color: '#D4AF37' }} />
    </div>
    <span className="text-sm" style={{ color: '#64748B' }}>{text}</span>
  </motion.div>
)

export default function WelcomeScreen({ onStart }) {
  return (
    <div className="w-full h-full relative overflow-hidden flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #080B14 0%, #0D1117 50%, #06090F 100%)' }}>

      {/* רקע — כדורי אור */}
      <Orb size={700} color="#D4AF37" x="-10%" y="-20%" delay={0} duration={12} />
      <Orb size={500} color="#0EA5E9" x="65%" y="-10%" delay={3} duration={9} />
      <Orb size={600} color="#10B981" x="70%" y="55%" delay={6} duration={11} />
      <Orb size={300} color="#8B5CF6" x="20%" y="70%" delay={2} duration={8} />

      {/* גריד רקע */}
      <div className="absolute inset-0 grid-bg opacity-100 pointer-events-none" />

      {/* קווי גרף מופשטים */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.04 }}>
        <path d="M0,400 Q200,200 400,300 T800,150 T1200,250 T1600,100" fill="none" stroke="#D4AF37" strokeWidth="2" />
        <path d="M0,450 Q300,300 600,380 T1000,200 T1400,320" fill="none" stroke="#0EA5E9" strokeWidth="1.5" />
        <path d="M0,500 Q250,350 500,420 T900,280 T1300,380" fill="none" stroke="#10B981" strokeWidth="1" />
      </svg>

      {/* כרטיסי מידע צפים */}
      <FloatingCard icon={TrendingUp} label="חיסכון חודשי" value="+₪1,240" color="#10B981" delay={0.8} x="5%" y="25%" />
      <FloatingCard icon={Shield} label="ציון אבטחה" value="98/100" color="#0EA5E9" delay={1.2} x="72%" y="20%" />
      <FloatingCard icon={Zap} label="תחזיות AI" value="החודש הבא" color="#D4AF37" delay={1.6} x="68%" y="65%" />

      {/* תוכן ראשי */}
      <div className="relative z-10 text-center px-8 max-w-3xl mx-auto">

        {/* לוגו */}
        <motion.div
          className="flex items-center justify-center mb-10"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, type: 'spring', stiffness: 200 }}
        >
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #D4AF37, #F5C842)',
                boxShadow: '0 0 40px rgba(212,175,55,0.4), 0 0 80px rgba(212,175,55,0.15)',
              }}>
              <span className="text-black font-black text-4xl">F</span>
            </div>
            <motion.div
              className="absolute -inset-3 rounded-3xl"
              style={{ border: '1px solid rgba(212,175,55,0.25)' }}
              animate={{ opacity: [0.25, 0.6, 0.25] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>
        </motion.div>

        {/* שם המוצר */}
        <motion.div className="mb-4"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}>
          <span className="text-2xl font-light tracking-[0.4em] uppercase" style={{ color: '#475569' }}>פיננסי</span>
          <span className="text-2xl font-black tracking-[0.4em] uppercase gold-text mr-1">IQ</span>
        </motion.div>

        {/* כותרת ראשית */}
        <motion.h1
          className="text-5xl sm:text-6xl font-extrabold leading-tight mb-6 text-balance"
          style={{ color: '#F1F5F9', letterSpacing: '-0.02em' }}
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}>
          הפוך הוצאות{' '}
          <span className="gold-text">להחלטות חכמות</span>
        </motion.h1>

        {/* תיאור */}
        <motion.p
          className="text-lg sm:text-xl mb-10 text-balance max-w-xl mx-auto"
          style={{ color: '#64748B', lineHeight: 1.7 }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}>
          העלה את ההוצאות החודשיות שלך וגלה תובנות מבוססות AI,
          ניתוח חיזויי ולוח בקרה פיננסי פרימיום.
        </motion.p>

        {/* תגיות תכונות */}
        <motion.div className="flex flex-wrap justify-center gap-3 mb-10"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}>
          {['תובנות AI', 'אנליטיקה חיה', 'תחזיות', 'דיאגרמת ERD', 'ציון חכם'].map(f => (
            <span key={f} className="px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', color: '#D4AF37' }}>
              {f}
            </span>
          ))}
        </motion.div>

        {/* כפתורי פעולה */}
        <motion.div className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}>
          <motion.button
            onClick={onStart}
            className="btn-gold px-8 py-4 rounded-2xl text-base font-bold flex items-center gap-3 group"
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            העלה הוצאות חודשיות
          </motion.button>

          <motion.button
            onClick={onStart}
            className="btn-glass px-6 py-4 rounded-2xl text-base"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            נסה עם נתוני הדגמה
          </motion.button>
        </motion.div>

        {/* אמינות */}
        <motion.div className="flex justify-center gap-8 mt-12"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}>
          <Feature icon={Shield} text="הצפנה ברמת בנק" delay={1.1} />
          <Feature icon={Zap} text="ניתוח מיידי" delay={1.2} />
          <Feature icon={TrendingUp} text="תובנות מבוססות AI" delay={1.3} />
        </motion.div>
      </div>

      {/* דהייה תחתונה */}
      <div className="absolute bottom-0 inset-x-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #080B14, transparent)' }} />
    </div>
  )
}
