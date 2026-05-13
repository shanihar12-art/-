export const CATEGORY_COLORS = {
  'Food & Dining':    '#D4AF37',
  'Groceries':        '#10B981',
  'Transportation':   '#0EA5E9',
  'Shopping':         '#8B5CF6',
  'Entertainment':    '#F43F5E',
  'Health & Fitness': '#06B6D4',
  'Bills & Utilities':'#F59E0B',
  'Education':        '#EC4899',
  'Travel':           '#84CC16',
  'Other':            '#64748B',
}

export const CATEGORY_ICONS = {
  'Food & Dining':    '🍽️',
  'Groceries':        '🛒',
  'Transportation':   '🚗',
  'Shopping':         '🛍️',
  'Entertainment':    '🎬',
  'Health & Fitness': '💊',
  'Bills & Utilities':'⚡',
  'Education':        '📚',
  'Travel':           '✈️',
  'Other':            '📦',
}

export const CATEGORY_NAMES_HE = {
  'Food & Dining':    'אוכל ומסעדות',
  'Groceries':        'סופרמרקט',
  'Transportation':   'תחבורה',
  'Shopping':         'קניות',
  'Entertainment':    'בידור',
  'Health & Fitness': 'בריאות וכושר',
  'Bills & Utilities':'חשבונות',
  'Education':        'חינוך',
  'Travel':           'נסיעות',
  'Other':            'אחר',
}

export const catHe = (name) => CATEGORY_NAMES_HE[name] || name

const MONTHS_HE = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר']
const DAYS_HE_SHORT = ['א׳','ב׳','ג׳','ד׳','ה׳','ו׳','שב']

function sum(arr) { return arr.reduce((a, b) => a + b, 0) }
function avg(arr) { return arr.length ? sum(arr) / arr.length : 0 }
function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key]
    if (!acc[k]) acc[k] = []
    acc[k].push(item)
    return acc
  }, {})
}

export function analyzeFinances(expenses) {
  if (!expenses || expenses.length === 0) return null

  const totalSpending = sum(expenses.map(e => e.amount))
  const avgTransaction = totalSpending / expenses.length

  const byCategory = groupBy(expenses, 'category')
  const categoryData = Object.entries(byCategory)
    .map(([name, items]) => ({
      name,
      nameHe: catHe(name),
      total: sum(items.map(i => i.amount)),
      count: items.length,
      average: avg(items.map(i => i.amount)),
      color: CATEGORY_COLORS[name] || '#64748B',
      icon: CATEGORY_ICONS[name] || '📦',
      pct: 0,
    }))
    .sort((a, b) => b.total - a.total)

  categoryData.forEach(c => { c.pct = (c.total / totalSpending * 100) })

  const byDate = groupBy(expenses, 'dateStr')
  const dailyData = Object.entries(byDate)
    .map(([date, items]) => ({
      date,
      label: formatDateLabel(date),
      total: sum(items.map(i => i.amount)),
      count: items.length,
      avg: avg(items.map(i => i.amount)),
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const allDays = fillMissingDays(dailyData)
  const weeklyData = calculateWeeklyData(expenses)
  const heatmapData = calculateHeatmap(expenses)
  const topCategory = categoryData[0] || null
  const biggestExpense = expenses.reduce((max, e) => e.amount > max.amount ? e : max, expenses[0])
  const weekdayData = calculateWeekdayData(expenses)
  const movingAvg = calculateMovingAverage(allDays, 7)
  const insights = generateInsights(expenses, categoryData, dailyData, totalSpending)
  const predictions = generatePredictions(expenses, categoryData, dailyData, totalSpending)
  const score = calculateFinancialScore(expenses, categoryData, totalSpending)
  const monthName = getMonthName(expenses)

  return {
    expenses,
    totalSpending,
    avgTransaction,
    categoryData,
    dailyData: allDays,
    weeklyData,
    heatmapData,
    topCategory,
    biggestExpense,
    weekdayData,
    movingAvg,
    insights,
    predictions,
    score,
    monthName,
    transactionCount: expenses.length,
    avgDailySpending: totalSpending / Math.max(allDays.filter(d => d.total > 0).length, 1),
    uniqueCategories: categoryData.length,
  }
}

function formatDateLabel(dateStr) {
  const [, m, d] = dateStr.split('-')
  return `${d}/${m}`
}

function fillMissingDays(dailyData) {
  if (dailyData.length === 0) return []
  const first = new Date(dailyData[0].date)
  const last = new Date(dailyData[dailyData.length - 1].date)
  const map = Object.fromEntries(dailyData.map(d => [d.date, d]))
  const result = []
  const cur = new Date(first)
  while (cur <= last) {
    const ds = formatDateStr(cur)
    result.push(map[ds] || { date: ds, label: formatDateLabel(ds), total: 0, count: 0, avg: 0 })
    cur.setDate(cur.getDate() + 1)
  }
  return result
}

function formatDateStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function calculateWeeklyData(expenses) {
  const weeks = {}
  expenses.forEach(e => {
    const d = new Date(e.dateStr)
    const weekNum = Math.ceil(d.getDate() / 7)
    const key = `שבוע ${weekNum}`
    if (!weeks[key]) weeks[key] = 0
    weeks[key] += e.amount
  })
  return Object.entries(weeks).map(([name, total]) => ({ name, total: Math.round(total) }))
}

function calculateHeatmap(expenses) {
  const data = DAYS_HE_SHORT.map(day => ({ day, value: 0, count: 0 }))
  expenses.forEach(e => {
    data[e.weekday].value += e.amount
    data[e.weekday].count += 1
  })
  const maxVal = Math.max(...data.map(d => d.value))
  return data.map(d => ({ ...d, intensity: maxVal > 0 ? d.value / maxVal : 0 }))
}

function calculateWeekdayData(expenses) {
  const names = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת']
  const data = Array(7).fill(0).map((_, i) => ({ name: names[i], total: 0, count: 0 }))
  expenses.forEach(e => {
    data[e.weekday].total += e.amount
    data[e.weekday].count += 1
  })
  return data
}

function calculateMovingAverage(dailyData, window) {
  return dailyData.map((d, i) => {
    const slice = dailyData.slice(Math.max(0, i - window + 1), i + 1)
    const validSlice = slice.filter(s => s.total > 0)
    return {
      ...d,
      ma: validSlice.length ? sum(validSlice.map(s => s.total)) / validSlice.length : 0
    }
  })
}

function generateInsights(expenses, categoryData, dailyData, total) {
  const insights = []

  if (categoryData.length > 0) {
    const top = categoryData[0]
    if (top.pct > 35) {
      insights.push({
        id: 1,
        type: 'warning',
        severity: 'high',
        icon: 'AlertTriangle',
        color: '#F59E0B',
        title: `הוצאות גבוהות — ${top.nameHe}`,
        message: `${top.nameHe} מהווה ${top.pct.toFixed(0)}% מסך ההוצאות שלך (₪${top.total.toFixed(0)}). זה גבוה משמעותית מהמומלץ של 25%.`,
        action: `שאף להפחית את הוצאות ה${top.nameHe} ב-15-20% בחודש הבא.`,
        saving: top.total * 0.18,
      })
    }
  }

  if (dailyData.length >= 14) {
    const activeDays = dailyData.filter(d => d.total > 0)
    if (activeDays.length >= 8) {
      const mid = Math.floor(activeDays.length / 2)
      const firstHalfAvg = avg(activeDays.slice(0, mid).map(d => d.total))
      const secondHalfAvg = avg(activeDays.slice(mid).map(d => d.total))
      if (secondHalfAvg > firstHalfAvg * 1.25) {
        insights.push({
          id: 2,
          type: 'alert',
          severity: 'medium',
          icon: 'TrendingUp',
          color: '#F43F5E',
          title: 'האצה בהוצאות — זהירות!',
          message: `ההוצאה היומית בחצי השני של החודש הייתה ${((secondHalfAvg / firstHalfAvg - 1) * 100).toFixed(0)}% גבוהה יותר מהחצי הראשון. תבנית זו עלולה להוביל לחריגה מהתקציב.`,
          action: 'הגדר התראת מגבלת הוצאות יומית כדי לשמור על הרגלים עקביים.',
          saving: (secondHalfAvg - firstHalfAvg) * activeDays.slice(mid).length * 0.5,
        })
      }
    }
  }

  const foodCat = categoryData.find(c => c.name === 'Food & Dining')
  if (foodCat && foodCat.count > 15) {
    insights.push({
      id: 3,
      type: 'tip',
      severity: 'medium',
      icon: 'Coffee',
      color: '#D4AF37',
      title: 'יציאות תכופות לאכול בחוץ',
      message: `ביצעת ${foodCat.count} עסקאות אוכל ומסעדות עם ממוצע של ₪${foodCat.average.toFixed(0)} לכל עסקה. הכנת אוכל בבית אפילו 3 ימים בשבוע יכולה לחסוך משמעותית.`,
      action: 'נסה להכין אוכל לארוחות צהריים בימי השבוע כדי להפחית עלויות.',
      saving: foodCat.total * 0.25,
    })
  }

  const shopCat = categoryData.find(c => c.name === 'Shopping')
  if (shopCat && shopCat.pct > 20) {
    insights.push({
      id: 4,
      type: 'alert',
      severity: 'medium',
      icon: 'ShoppingBag',
      color: '#8B5CF6',
      title: 'תבנית קניות אימפולסיביות',
      message: `קניות מהוות ${shopCat.pct.toFixed(0)}% מההוצאות (₪${shopCat.total.toFixed(0)}). ${shopCat.count} עסקאות מצביעות על קניות אימפולסיביות אפשריות.`,
      action: 'יישם כלל המתנה של 48 שעות לפני רכישות לא הכרחיות.',
      saving: shopCat.total * 0.3,
    })
  }

  if (total < 8000) {
    insights.push({
      id: 5,
      type: 'success',
      severity: 'low',
      icon: 'CheckCircle',
      color: '#10B981',
      title: 'תקציב חודשי מאוזן',
      message: `סך הוצאות של ₪${total.toFixed(0)} נמצא בטווח בריא. אתה מפגין משמעת פיננסית מצוינת החודש.`,
      action: 'שקול להקצות 10-15% מהחיסכון לקרן חירום.',
      saving: 0,
    })
  }

  const weekendExpenses = expenses.filter(e => e.weekday === 5 || e.weekday === 6)
  const weekendTotal = sum(weekendExpenses.map(e => e.amount))
  const weekendPct = total > 0 ? (weekendTotal / total * 100) : 0
  if (weekendPct > 35) {
    insights.push({
      id: 6,
      type: 'tip',
      severity: 'low',
      icon: 'Calendar',
      color: '#0EA5E9',
      title: 'זינוק בהוצאות בסוף שבוע',
      message: `${weekendPct.toFixed(0)}% מההוצאות מתרחשות בסוף השבוע. תכנון פעילויות מראש יכול להפחית הוצאות ספונטניות.`,
      action: 'צור תקציב לפעילויות סוף שבוע ועמוד בו.',
      saving: weekendTotal * 0.2,
    })
  }

  return insights
}

function generatePredictions(expenses, categoryData, dailyData, total) {
  const activeDays = dailyData.filter(d => d.total > 0).length || 1
  const dailyRate = total / activeDays
  const predictedTotal = dailyRate * 30

  const categoryPredictions = categoryData.map(cat => {
    const trend = 1 + (Math.random() * 0.2 - 0.1)
    return {
      name: cat.name,
      nameHe: cat.nameHe,
      current: cat.total,
      predicted: cat.total * trend,
      change: (trend - 1) * 100,
      color: cat.color,
      icon: cat.icon,
    }
  })

  const totalPotentialSaving = categoryData.reduce((acc, c) => {
    if (c.pct > 25) return acc + c.total * 0.15
    return acc
  }, 0)

  return {
    nextMonthTotal: predictedTotal,
    currentTotal: total,
    change: ((predictedTotal / total) - 1) * 100,
    categoryPredictions,
    potentialSaving: totalPotentialSaving,
    budgetSuggestion: total * 0.85,
    savingsGoal: Math.max(total * 0.1, 500),
  }
}

function calculateFinancialScore(expenses, categoryData, total) {
  let score = 75

  if (categoryData.length >= 5) score += 5
  if (categoryData.length >= 7) score += 5
  if (categoryData[0] && categoryData[0].pct > 40) score -= 10
  if (categoryData[0] && categoryData[0].pct > 50) score -= 10
  if (total < 5000) score += 10
  else if (total > 15000) score -= 10
  else if (total > 10000) score -= 5
  const hasBills = categoryData.some(c => c.name === 'Bills & Utilities')
  if (hasBills) score += 5
  score = Math.min(99, Math.max(30, score))

  let rating, color, message
  if (score >= 80) {
    rating = 'מצוין'; color = '#10B981'
    message = 'אתה שומר על משמעת פיננסית מצוינת עם הוצאות מאוזנות היטב.'
  } else if (score >= 65) {
    rating = 'טוב'; color = '#D4AF37'
    message = 'הרגלים פיננסיים טובים עם כמה תחומים לשיפור.'
  } else if (score >= 50) {
    rating = 'סביר'; color = '#F59E0B'
    message = 'יש לשים לב לכמה תבניות הוצאות כדי לשפר את הבריאות הפיננסית.'
  } else {
    rating = 'דורש שיפור'; color = '#F43F5E'
    message = 'זוהו חוסרי איזון משמעותיים בהוצאות. התמקד בהפחתת הקטגוריות המובילות.'
  }

  return { score, rating, color, message }
}

function getMonthName(expenses) {
  if (!expenses.length) return ''
  const monthCounts = {}
  expenses.forEach(e => {
    const key = `${e.year}-${e.month}`
    monthCounts[key] = (monthCounts[key] || 0) + 1
  })
  const topMonth = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0][0]
  const [year, month] = topMonth.split('-')
  return `${MONTHS_HE[+month - 1]} ${year}`
}
