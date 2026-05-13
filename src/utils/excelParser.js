import * as XLSX from 'xlsx'

const CATEGORY_KEYWORDS = {
  'Food & Dining': [
    'restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'sushi', 'shawarma', 'falafel',
    'מסעדה', 'קפה', 'פיצה', 'שווארמה', 'פלאפל', 'סושי', 'אוכל', 'מזון', 'בורגר',
    'mcdonalds', 'kfc', 'subway', 'dominos', 'aroma', 'ארומה', 'אגדלג'
  ],
  'Groceries': [
    'supermarket', 'grocery', 'market', 'rami levy', 'shufersal', 'yeinot bitan',
    'רמי לוי', 'שופרסל', 'יינות ביתן', 'מגה', 'ויקטורי', 'סופר', 'שוק', 'מכולת',
    'mega', 'victory', 'osher ad', 'אושר עד', 'fresh market', 'פרש מרקט'
  ],
  'Transportation': [
    'fuel', 'gas', 'petrol', 'parking', 'uber', 'taxi', 'bus', 'train', 'metro',
    'דלק', 'חניה', 'אוטובוס', 'רכבת', 'מונית', 'פז', 'סונול', 'דור אלון',
    'paz', 'sonol', 'delek', 'gett', 'bolt', 'waze carpool', 'רב קו'
  ],
  'Shopping': [
    'amazon', 'online', 'store', 'shop', 'mall', 'zara', 'h&m', 'nike', 'adidas',
    'קניון', 'חנות', 'זארה', 'קניות', 'איקאה', 'ikea', 'ksp', 'bug', 'castro',
    'renuar', 'renuant', 'fox', 'פוקס', 'קסטרו', 'רנואר', 'golbari', 'גולברי'
  ],
  'Entertainment': [
    'cinema', 'movie', 'netflix', 'spotify', 'music', 'concert', 'theater', 'game',
    'קולנוע', 'סרט', 'מוסיקה', 'הופעה', 'תיאטרון', 'משחק', 'בידור',
    'yes', 'hot', 'cellcom', 'partner', 'steam', 'playstation', 'xbox'
  ],
  'Health & Fitness': [
    'pharmacy', 'doctor', 'medical', 'hospital', 'gym', 'fitness', 'sport', 'clinic',
    'בית מרקחת', 'רופא', 'בית חולים', 'קופת חולים', 'כושר', 'ספורט', 'קליניקה',
    'super pharm', 'סופר פארם', 'be', 'goldsgym', 'maccabi', 'clalit', 'leumit',
    'מכבי', 'כללית', 'לאומית', 'פארם'
  ],
  'Bills & Utilities': [
    'electric', 'water', 'internet', 'phone', 'insurance', 'municipality', 'arnona',
    'חשמל', 'מים', 'אינטרנט', 'טלפון', 'ביטוח', 'ארנונה', 'גז', 'וועד',
    'bezeq', 'בזק', 'hot', 'yes', 'cellcom', 'partner', 'pelephone', 'orange',
    'electric corp', 'חברת חשמל', 'מקורות'
  ],
  'Education': [
    'university', 'college', 'school', 'course', 'book', 'tuition', 'udemy',
    'אוניברסיטה', 'מכללה', 'בית ספר', 'קורס', 'ספר', 'שכר לימוד', 'חינוך',
    'technion', 'huji', 'tau', 'bgu', 'bar ilan', 'אפקה', 'רופין'
  ],
  'Travel': [
    'hotel', 'flight', 'airbnb', 'booking', 'airline', 'airport', 'visa',
    'מלון', 'טיסה', 'נסיעה', 'תיירות', 'דרכון', 'אל על', 'el al', 'ryanair'
  ],
}

const COLUMN_ALIASES = {
  date: ['date', 'תאריך', 'Date', 'transaction date', 'תאריך עסקה', 'תאריך פעולה'],
  amount: ['amount', 'סכום', 'sum', 'charge', 'debit', 'credit', 'חיוב', 'זכות', 'Amount', 'price'],
  description: ['description', 'תיאור', 'merchant', 'details', 'פירוט', 'שם בית עסק', 'name', 'narrative'],
  category: ['category', 'קטגוריה', 'type', 'סוג', 'Classification'],
}

function normalizeColumnName(name) {
  if (!name) return ''
  const lower = String(name).trim().toLowerCase()
  for (const [key, aliases] of Object.entries(COLUMN_ALIASES)) {
    if (aliases.some(alias => lower.includes(alias.toLowerCase()))) return key
  }
  return lower
}

function parseDate(value) {
  if (!value) return null
  if (typeof value === 'number') {
    // Excel serial date
    const date = XLSX.SSF.parse_date_code(value)
    if (date) return new Date(date.y, date.m - 1, date.d)
  }
  const str = String(value).trim()
  // Try common formats
  const formats = [
    /(\d{4})[/-](\d{1,2})[/-](\d{1,2})/, // YYYY-MM-DD
    /(\d{1,2})[/-](\d{1,2})[/-](\d{4})/, // DD/MM/YYYY
    /(\d{1,2})\.(\d{1,2})\.(\d{4})/,     // DD.MM.YYYY
  ]
  for (const fmt of formats) {
    const m = str.match(fmt)
    if (m) {
      const [, a, b, c] = m
      const year = a.length === 4 ? +a : +c
      const month = a.length === 4 ? +b : +b
      const day = a.length === 4 ? +c : +a
      const d = new Date(year, month - 1, day)
      if (!isNaN(d)) return d
    }
  }
  const d = new Date(str)
  return isNaN(d) ? null : d
}

function parseAmount(value) {
  if (typeof value === 'number') return Math.abs(value)
  const str = String(value).replace(/[₪$,\s]/g, '').trim()
  const num = parseFloat(str)
  return isNaN(num) ? 0 : Math.abs(num)
}

function detectCategory(description) {
  if (!description) return 'Other'
  const lower = description.toLowerCase()
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw.toLowerCase()))) return category
  }
  return 'Other'
}

function formatDateStr(date) {
  if (!date) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array', cellDates: true })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })

        if (rows.length < 2) throw new Error('File has no data rows')

        // Find header row (first non-empty row)
        let headerRow = 0
        for (let i = 0; i < Math.min(5, rows.length); i++) {
          if (rows[i].some(cell => cell !== '')) { headerRow = i; break }
        }

        const headers = rows[headerRow].map(normalizeColumnName)
        const colMap = {}
        headers.forEach((h, i) => { if (h && !colMap[h]) colMap[h] = i })

        const expenses = []
        for (let i = headerRow + 1; i < rows.length; i++) {
          const row = rows[i]
          if (row.every(cell => cell === '' || cell === null || cell === undefined)) continue

          const rawAmount = row[colMap.amount]
          const amount = parseAmount(rawAmount)
          if (amount <= 0) continue

          const rawDate = row[colMap.date]
          const date = parseDate(rawDate)
          if (!date) continue

          const description = String(row[colMap.description] || row[1] || '').trim()
          const rawCategory = colMap.category !== undefined ? String(row[colMap.category] || '').trim() : ''
          const category = rawCategory || detectCategory(description)

          expenses.push({
            id: i,
            date,
            dateStr: formatDateStr(date),
            day: date.getDate(),
            month: date.getMonth() + 1,
            year: date.getFullYear(),
            weekday: date.getDay(),
            amount,
            description: description || `Transaction ${i}`,
            category,
            merchant: description,
          })
        }

        if (expenses.length === 0) throw new Error('No valid expense rows found')
        resolve(expenses)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

export const DEMO_DATA = generateDemoExpenses()

function generateDemoExpenses() {
  const MERCHANTS = {
    'Food & Dining': ['Aroma Cafe', 'The Kitchen', 'Burger Ranch', 'Pizza Hut', 'Sushi Bar', 'Shwarma Express', 'Al Dente', 'Cafe Greg', 'Dr. Shakshuka', 'Benedict'],
    'Groceries': ['Shufersal', 'Rami Levy', 'Yeinot Bitan', 'Mega', 'Victory', 'Osher Ad', 'Fresh Market', 'Makolet Local', 'Super Dosh'],
    'Transportation': ['Paz Gas Station', 'Sonol', 'Delek', 'Gett Taxi', 'Parking Tel Aviv', 'Train Monthly', 'Bus Card Top-up'],
    'Shopping': ['Zara', 'H&M', 'Castro', 'Fox', 'Amazon IL', 'KSP Tech', 'IKEA', 'Renuar', 'Golf Fashion', 'Bug Electronics'],
    'Entertainment': ['Hot VOD', 'Netflix', 'Spotify', 'Cinema City', 'Yes Sport', 'Steam Games', 'Concert Tickets', 'Museum Pass'],
    'Health & Fitness': ['Super Pharm', 'Maccabi Clinic', 'Gold\'s Gym', 'Clalit', 'Pharmacy Plus', 'Fitness First'],
    'Bills & Utilities': ['Electric Corp', 'Hot Internet', 'Bezeq Phone', 'Water Authority', 'Cellcom', 'Insurance Monthly', 'Arnona Tax'],
    'Education': ['Udemy Course', 'University Fee', 'Book Store', 'Coursera', 'Workshop Fee'],
  }
  const AMOUNTS = {
    'Food & Dining': [18, 45, 65, 32, 89, 52, 38, 120, 28, 44],
    'Groceries': [145, 280, 320, 195, 88, 450, 210, 65, 175],
    'Transportation': [250, 280, 120, 89, 65, 380, 45],
    'Shopping': [189, 320, 245, 180, 450, 890, 1200, 340, 220, 780],
    'Entertainment': [49, 59, 39, 89, 129, 45, 250, 85],
    'Health & Fitness': [38, 120, 280, 95, 55, 350],
    'Bills & Utilities': [380, 220, 180, 95, 290, 450, 1200],
    'Education': [150, 800, 95, 200, 350],
  }

  const expenses = []
  const year = 2026
  const month = 3 // April

  const schedule = [
    { cat: 'Food & Dining', freq: 22 },
    { cat: 'Groceries', freq: 8 },
    { cat: 'Transportation', freq: 14 },
    { cat: 'Shopping', freq: 6 },
    { cat: 'Entertainment', freq: 5 },
    { cat: 'Health & Fitness', freq: 4 },
    { cat: 'Bills & Utilities', freq: 5 },
    { cat: 'Education', freq: 2 },
  ]

  let id = 1
  const rand = (arr) => arr[Math.floor(Math.random() * arr.length)]
  const jitter = (n) => n + (Math.random() - 0.5) * n * 0.3

  for (const { cat, freq } of schedule) {
    for (let i = 0; i < freq; i++) {
      const day = Math.floor(Math.random() * 30) + 1
      const date = new Date(year, month, day)
      const baseAmount = rand(AMOUNTS[cat])
      expenses.push({
        id: id++,
        date,
        dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        day,
        month: month + 1,
        year,
        weekday: date.getDay(),
        amount: Math.round(jitter(baseAmount) * 100) / 100,
        description: rand(MERCHANTS[cat]),
        category: cat,
        merchant: rand(MERCHANTS[cat]),
      })
    }
  }

  return expenses.sort((a, b) => a.dateStr.localeCompare(b.dateStr))
}
