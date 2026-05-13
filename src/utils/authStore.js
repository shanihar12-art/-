const USERS_KEY = 'fiq_users'
const SESSION_KEY = 'fiq_session'

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]') }
  catch { return [] }
}

export function register({ name, email, password }) {
  const users = getUsers()
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
    throw new Error('כתובת האימייל כבר רשומה במערכת')
  const user = {
    id: `u_${Date.now()}`,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    hash: btoa(password),
    createdAt: new Date().toISOString(),
  }
  users.push(user)
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  const session = { id: user.id, name: user.name, email: user.email, initial: user.name.charAt(0).toUpperCase() }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export function login({ email, password }) {
  const users = getUsers()
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())
  if (!user || user.hash !== btoa(password)) throw new Error('אימייל או סיסמה שגויים')
  const session = { id: user.id, name: user.name, email: user.email, initial: user.name.charAt(0).toUpperCase() }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
}

export function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)) }
  catch { return null }
}

// ── History per user ──────────────────────────────────────────
export function saveUpload(userId, analysisData) {
  const key = `fiq_history_${userId}`
  const history = getHistory(userId)
  const entry = {
    id: `up_${Date.now()}`,
    monthName: analysisData.monthName,
    totalSpending: analysisData.totalSpending,
    transactionCount: analysisData.transactionCount,
    avgDailySpending: analysisData.avgDailySpending,
    topCategory: analysisData.topCategory?.nameHe || analysisData.topCategory?.name || '—',
    score: analysisData.score?.score,
    scoreRating: analysisData.score?.rating,
    scoreColor: analysisData.score?.color,
    categoryData: analysisData.categoryData?.map(c => ({
      name: c.name, nameHe: c.nameHe, total: c.total, pct: c.pct, color: c.color, icon: c.icon
    })),
    savedAt: new Date().toISOString(),
  }
  const idx = history.findIndex(e => e.monthName === entry.monthName)
  if (idx >= 0) history[idx] = entry
  else history.unshift(entry)
  localStorage.setItem(key, JSON.stringify(history.slice(0, 24)))
  return history
}

export function getHistory(userId) {
  try { return JSON.parse(localStorage.getItem(`fiq_history_${userId}`) || '[]') }
  catch { return [] }
}
