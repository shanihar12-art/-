import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react'
import { login, register } from '../utils/authStore'

const Orb = ({ size, color, x, y, delay }) => (
  <motion.div className="absolute rounded-full pointer-events-none"
    style={{ width: size, height: size, background: `radial-gradient(circle, ${color} 0%, transparent 70%)`, left: x, top: y, filter: 'blur(70px)', opacity: 0.3 }}
    animate={{ x: [0, 20, -10, 0], y: [0, -15, 20, 0], scale: [1, 1.06, 0.96, 1] }}
    transition={{ duration: 10, delay, repeat: Infinity, ease: 'easeInOut' }} />
)

function Field({ icon: Icon, label, type = 'text', value, onChange, error, placeholder }) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold" style={{ color: '#64748B' }}>{label}</label>
      <div className="relative">
        <div className="absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none">
          <Icon size={16} style={{ color: error ? '#F43F5E' : '#475569' }} />
        </div>
        <input
          type={isPassword && show ? 'text' : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl py-3 pr-10 pl-10 text-sm transition-all duration-200 outline-none"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${error ? 'rgba(244,63,94,0.4)' : 'rgba(255,255,255,0.08)'}`,
            color: '#F1F5F9',
            direction: 'ltr',
          }}
          onFocus={e => { e.target.style.borderColor = error ? 'rgba(244,63,94,0.6)' : 'rgba(212,175,55,0.4)' }}
          onBlur={e => { e.target.style.borderColor = error ? 'rgba(244,63,94,0.4)' : 'rgba(255,255,255,0.08)' }}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(!show)}
            className="absolute top-1/2 -translate-y-1/2 left-3"
            style={{ color: '#475569' }}>
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs" style={{ color: '#F43F5E' }}>{error}</p>}
    </div>
  )
}

export default function AuthScreen({ onAuth }) {
  const [tab, setTab] = useState('login') // 'login' | 'register'
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState('')
  const [success, setSuccess] = useState('')

  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [loginErrors, setLoginErrors] = useState({})

  // Register state
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPass, setRegPass] = useState('')
  const [regConfirm, setRegConfirm] = useState('')
  const [regErrors, setRegErrors] = useState({})

  const validateLogin = () => {
    const e = {}
    if (!loginEmail) e.email = 'נדרש אימייל'
    else if (!/\S+@\S+\.\S+/.test(loginEmail)) e.email = 'כתובת אימייל לא תקינה'
    if (!loginPass) e.pass = 'נדרשת סיסמה'
    setLoginErrors(e)
    return Object.keys(e).length === 0
  }

  const validateRegister = () => {
    const e = {}
    if (!regName.trim()) e.name = 'נדרש שם מלא'
    if (!regEmail) e.email = 'נדרש אימייל'
    else if (!/\S+@\S+\.\S+/.test(regEmail)) e.email = 'כתובת אימייל לא תקינה'
    if (!regPass) e.pass = 'נדרשת סיסמה'
    else if (regPass.length < 6) e.pass = 'הסיסמה חייבת להכיל לפחות 6 תווים'
    if (regPass !== regConfirm) e.confirm = 'הסיסמאות אינן תואמות'
    setRegErrors(e)
    return Object.keys(e).length === 0
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setGlobalError('')
    if (!validateLogin()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    try {
      const user = login({ email: loginEmail, password: loginPass })
      setSuccess(`ברוך הבא, ${user.name}!`)
      await new Promise(r => setTimeout(r, 700))
      onAuth(user)
    } catch (err) {
      setGlobalError(err.message)
    } finally { setLoading(false) }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setGlobalError('')
    if (!validateRegister()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 700))
    try {
      const user = register({ name: regName, email: regEmail, password: regPass })
      setSuccess(`החשבון נוצר בהצלחה! ברוך הבא, ${user.name}!`)
      await new Promise(r => setTimeout(r, 800))
      onAuth(user)
    } catch (err) {
      setGlobalError(err.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="w-full h-full relative overflow-hidden flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #080B14 0%, #0D1117 50%, #06090F 100%)' }}>

      <Orb size={600} color="#D4AF37" x="-5%" y="5%" delay={0} />
      <Orb size={500} color="#0EA5E9" x="60%" y="-10%" delay={3} />
      <Orb size={400} color="#10B981" x="65%" y="60%" delay={6} />
      <div className="absolute inset-0 grid-bg pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-6">

        {/* Logo */}
        <motion.div className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #F5C842)', boxShadow: '0 0 30px rgba(212,175,55,0.3)' }}>
            <span className="text-black font-black text-2xl">F</span>
          </div>
          <span className="text-xl font-bold" style={{ color: '#F1F5F9' }}>
            פיננסי<span className="gold-text">IQ</span>
          </span>
        </motion.div>

        {/* Card */}
        <motion.div className="glass-strong rounded-3xl p-8"
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}>

          {/* Tab switcher */}
          <div className="flex rounded-xl p-1 mb-8" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {[{ id: 'login', label: 'כניסה' }, { id: 'register', label: 'הרשמה' }].map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); setGlobalError(''); setSuccess('') }}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 relative">
                {tab === t.id && (
                  <motion.div layoutId="auth-tab"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.2)' }} />
                )}
                <span className="relative" style={{ color: tab === t.id ? '#D4AF37' : '#475569' }}>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Success message */}
          <AnimatePresence>
            {success && (
              <motion.div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-5"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <CheckCircle size={16} style={{ color: '#10B981' }} />
                <span className="text-sm font-medium" style={{ color: '#10B981' }}>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error message */}
          <AnimatePresence>
            {globalError && (
              <motion.div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-5"
                style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)' }}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <AlertCircle size={16} style={{ color: '#F43F5E' }} />
                <span className="text-sm font-medium" style={{ color: '#F43F5E' }}>{globalError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {tab === 'login' ? (
              <motion.form key="login" onSubmit={handleLogin} className="space-y-4"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}>
                <Field icon={Mail} label="כתובת אימייל" type="email" value={loginEmail}
                  onChange={setLoginEmail} error={loginErrors.email} placeholder="you@example.com" />
                <Field icon={Lock} label="סיסמה" type="password" value={loginPass}
                  onChange={setLoginPass} error={loginErrors.pass} placeholder="••••••••" />
                <motion.button type="submit" disabled={loading}
                  className="btn-gold w-full py-3.5 rounded-xl text-sm font-bold mt-2"
                  whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}>
                  {loading ? 'מתחבר...' : 'כניסה לחשבון'}
                </motion.button>
              </motion.form>
            ) : (
              <motion.form key="register" onSubmit={handleRegister} className="space-y-4"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}>
                <Field icon={User} label="שם מלא" value={regName}
                  onChange={setRegName} error={regErrors.name} placeholder="ישראל ישראלי" />
                <Field icon={Mail} label="כתובת אימייל" type="email" value={regEmail}
                  onChange={setRegEmail} error={regErrors.email} placeholder="you@example.com" />
                <Field icon={Lock} label="סיסמה" type="password" value={regPass}
                  onChange={setRegPass} error={regErrors.pass} placeholder="לפחות 6 תווים" />
                <Field icon={Lock} label="אימות סיסמה" type="password" value={regConfirm}
                  onChange={setRegConfirm} error={regErrors.confirm} placeholder="הזן שוב את הסיסמה" />
                <motion.button type="submit" disabled={loading}
                  className="btn-gold w-full py-3.5 rounded-xl text-sm font-bold mt-2"
                  whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}>
                  {loading ? 'יוצר חשבון...' : 'יצירת חשבון חדש'}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <motion.p className="text-center text-xs mt-6" style={{ color: '#334155' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          הנתונים שלך מאוחסנים באופן מקומי ומאובטח על המכשיר שלך
        </motion.p>
      </div>
    </div>
  )
}
