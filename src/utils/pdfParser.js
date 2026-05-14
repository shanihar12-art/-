// Loads PDF.js from /public/pdfjs/pdf.mjs via Blob URL
// (bypasses Vite's module interception in dev mode)

let _lib = null

async function getPdfjs() {
  if (_lib) return _lib

  const base = import.meta.env.BASE_URL   // '/' dev · '/-/' prod
  const fileUrl   = `${location.origin}${base}pdfjs/pdf.mjs`
  const workerUrl = `${location.origin}${base}pdfjs/pdf.worker.mjs`

  // Fetch the ESM file and re-import it via a Blob URL so Vite
  // doesn't try to bundle/transform it at runtime
  const res  = await fetch(fileUrl)
  if (!res.ok) throw new Error(`Cannot load PDF.js: ${res.status}`)
  const src  = await res.text()
  const blob = new Blob([src], { type: 'application/javascript' })
  const burl = URL.createObjectURL(blob)

  _lib = await import(/* @vite-ignore */ burl)
  URL.revokeObjectURL(burl)

  _lib.GlobalWorkerOptions.workerSrc = workerUrl
  return _lib
}

// ── Extract text lines from PDF ────────────────────────────────
export async function extractTextFromPDF(file) {
  const lib    = await getPdfjs()
  const buffer = await file.arrayBuffer()
  const pdf    = await lib.getDocument({ data: buffer }).promise

  const allLines = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page    = await pdf.getPage(i)
    const content = await page.getTextContent()

    // Group text items by Y position → reconstruct logical lines
    const byY = {}
    for (const item of content.items) {
      const s = item.str
      if (!s?.trim()) continue
      const y = Math.round(item.transform[5])
      if (!byY[y]) byY[y] = []
      byY[y].push({ x: item.transform[4], str: s })
    }

    const ys = Object.keys(byY).map(Number).sort((a, b) => b - a)
    for (const y of ys) {
      const line = byY[y]
        .sort((a, b) => a.x - b.x)
        .map(it => it.str)
        .join(' ')
        .trim()
      if (line) allLines.push(line)
    }
  }

  return allLines.join('\n')
}

// ── Category detection for PDF transactions ───────────────────
const CATEGORY_RULES = [
  [/אופנה|ריהוט|קניות|זארה|zara|asos|amazon|h&m|fox|castro|renuar|golf|bug|ksp|ikea|מדמוזל|ביגוד/i, 'Shopping'],
  [/מזון|סופרמרקט|שופרסל|רמי לוי|יינות|מגה|ויקטורי|אושר|shufersal|rami|mega|victory|makolet|fresh market/i, 'Groceries'],
  [/מסעדה|קפה|אוכל|ארומה|בורגר|פיצה|סושי|שווארמה|aroma|burger|pizza|sushi|restaurant|cafe|kitchen|bistro|benedict|shakshuka/i, 'Food & Dining'],
  [/דלק|חניה|סונול|פז|דור|sonol|paz|delek|uber|gett|bolt|taxi|parking|תחנת|רב.קו|אוטובוס|רכבת/i, 'Transportation'],
  [/בידור|נטפליקס|ספוטיפיי|netflix|spotify|hot vod|cinema|קולנוע|steam|playstation|xbox|concert|תיאטרון/i, 'Entertainment'],
  [/ביטוח|אינטרנט|טלפון|חשמל|מים|בזק|bezeq|cellcom|partner|pelephone|orange|hot|yes|openai|chatgpt|חשבים|עיריה|ארנונה|מקורות/i, 'Bills & Utilities'],
  [/רופא|בית.חולים|קופת.חולים|כושר|ספורט|פארם|gym|sport|maccabi|clalit|leumit|pharm|clinic/i, 'Health & Fitness'],
  [/אוניברסיטה|מכללה|קורס|ספר|שכר.לימוד|udemy|coursera|technion|university/i, 'Education'],
  [/מלון|טיסה|booking|airbnb|אל.על|el.al|hotel|flight|airport/i, 'Travel'],
]

function detectCategoryFromText(text) {
  for (const [rx, cat] of CATEGORY_RULES) {
    if (rx.test(text)) return cat
  }
  return 'other'
}

// ── Parse transactions from text ───────────────────────────────
export function parseTransactionsFromText(text) {
  const lines    = text.split(/[\n\r]+/).map(l => l.trim()).filter(Boolean)
  const expenses = []

  const dateRx = [
    /\b(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{4})\b/,
    /\b(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{2})\b/,
    /\b(\d{4})[\/\.\-](\d{1,2})[\/\.\-](\d{1,2})\b/,
  ]
  const moneyRx = /\b\d{1,6}(?:,\d{3})*(?:\.\d{1,2})?\b/g
  const skipRx  = /סה[""כ]|סהכ|total|balance|יתרה|הכנסות|תאריך|פירוט|סכום|page|עמוד|\*\*\*/i

  for (const line of lines) {
    if (skipRx.test(line) || line.length < 5) continue

    let dm = null
    for (const rx of dateRx) { dm = line.match(rx); if (dm) break }
    if (!dm) continue

    let day, month, year
    if (dm[1].length === 4) { year = +dm[1]; month = +dm[2]; day = +dm[3] }
    else if (dm[3].length === 4) { day = +dm[1]; month = +dm[2]; year = +dm[3] }
    else { day = +dm[1]; month = +dm[2]; year = 2000 + +dm[3] }

    if (month < 1 || month > 12 || day < 1 || day > 31) continue
    if (year < 2010 || year > 2035) continue

    const nums = [...line.matchAll(moneyRx)]
      .map(m => parseFloat(m[0].replace(/,/g, '')))
      .filter(n => n >= 1 && n < 100_000 && n !== year && n !== day && n !== month)
    if (!nums.length) continue

    // כאל PDFs are RTL → after LTR-sort by X, the charge amount ("סכום חיוב")
    // always appears FIRST in the extracted line (it's the leftmost column).
    const amount = nums[0]

    // Clean description: remove date, all numbers, currency symbols, common filler
    let desc = line.replace(dm[0], '')
    desc = desc
      .replace(/\b\d+(?:[.,]\d+)?\b/g, '')  // remove all numbers
      .replace(/[₪$€,]/g, '')
      .replace(/\bלא\b/g, '')               // כרטיס column filler
      .replace(/\bתשלום\b/g, '')            // installment label
      .replace(/\bמ-/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim()
    if (!desc || desc.length < 2) desc = 'עסקה'

    const category = detectCategoryFromText(desc)
    const dateObj  = new Date(year, month - 1, day)

    expenses.push({
      id:          `pdf_${expenses.length + 1}`,
      date:        dateObj,
      dateStr:     `${String(year)}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`,
      day, month, year,
      weekday:     dateObj.getDay(),
      amount,
      description: desc,
      category,
      merchant:    desc.trim().split(/\s+/).slice(-1)[0] || desc,
    })
  }

  return expenses
}
