// PDF.js served locally from /public/pdfjs/ — no CDN dependency
// Files are loaded relative to the app base URL (works in dev + GitHub Pages)

let _lib = null

async function getPdfjs() {
  if (_lib) return _lib
  const base = import.meta.env.BASE_URL          // '/' in dev, '/-/' in prod
  _lib = await import(/* @vite-ignore */ `${base}pdfjs/pdf.mjs`)
  _lib.GlobalWorkerOptions.workerSrc = `${base}pdfjs/pdf.worker.mjs`
  return _lib
}

// ── Extract raw text lines from PDF ──────────────────────────
export async function extractTextFromPDF(file) {
  const lib    = await getPdfjs()
  const buffer = await file.arrayBuffer()
  const pdf    = await lib.getDocument({ data: buffer }).promise

  const allLines = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page    = await pdf.getPage(i)
    const content = await page.getTextContent()

    // Group items into lines by their Y position
    const byY = {}
    for (const item of content.items) {
      if (!item.str?.trim()) continue
      const y = Math.round(item.transform[5])
      if (!byY[y]) byY[y] = []
      byY[y].push({ x: item.transform[4], str: item.str })
    }

    // Sort Y descending (top of page first), then X ascending (left to right)
    const sortedYs = Object.keys(byY)
      .map(Number)
      .sort((a, b) => b - a)

    for (const y of sortedYs) {
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

// ── Parse transactions from extracted text ────────────────────
export function parseTransactionsFromText(text) {
  const lines    = text.split(/[\n\r]+/).map(l => l.trim()).filter(Boolean)
  const expenses = []

  // Date patterns: DD/MM/YYYY  DD/MM/YY  DD.MM.YYYY  YYYY-MM-DD
  const dateRx = [
    /\b(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{4})\b/,
    /\b(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{2})\b/,
    /\b(\d{4})[\/\.\-](\d{1,2})[\/\.\-](\d{1,2})\b/,
  ]

  // Grab every money-like number: 1,234.56 / 1234.56 / 1,234 / 1234
  const moneyRx = /\b\d{1,6}(?:,\d{3})*(?:\.\d{1,2})?\b/g

  // Lines to skip (totals, headers, footers)
  const skipRx  = /סה[""כ]|סהכ|total|balance|יתרה|הכנסות|תאריך|פירוט|סכום|מינוס|page|עמוד|\*\*\*/i

  for (const line of lines) {
    if (skipRx.test(line) || line.length < 5) continue

    // Try each date pattern
    let dm = null, yr4
    for (const rx of dateRx) {
      dm = line.match(rx)
      if (dm) break
    }
    if (!dm) continue

    // Resolve year
    let day, month, year
    if (dm[3].length === 4 || dm[1].length === 4) {
      // YYYY-MM-DD
      if (dm[1].length === 4) { year = +dm[1]; month = +dm[2]; day = +dm[3] }
      else                    { day  = +dm[1]; month = +dm[2]; year = +dm[3] }
    } else {
      day   = +dm[1]
      month = +dm[2]
      year  = 2000 + +dm[3]
    }
    if (month < 1 || month > 12 || day < 1 || day > 31) continue
    if (year  < 2010 || year > 2035)                     continue

    // Collect candidate amounts
    const nums = [...line.matchAll(moneyRx)]
      .map(m => parseFloat(m[0].replace(/,/g, '')))
      .filter(n => n >= 1 && n < 100_000 && n !== year && n !== day && n !== month)

    if (!nums.length) continue

    // Heuristic: last number is usually the charge amount
    const amount = nums[nums.length - 1]

    // Description: remove the matched date and the amount, clean up
    let desc = line
      .replace(dm[0], '')
      .replace(new RegExp(
        amount.toLocaleString('en-US').replace('.', '\\.') + '|' +
        Math.round(amount).toString(),
        'g'
      ), '')
      .replace(/[₪$€,]/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim()

    if (!desc || desc.length < 2) desc = 'עסקה'

    expenses.push({
      id:          `pdf_${expenses.length + 1}`,
      date:        new Date(year, month - 1, day),
      dateStr:     `${String(day).padStart(2,'0')}/${String(month).padStart(2,'0')}/${year}`,
      day, month, year,
      weekday:     new Date(year, month - 1, day).getDay(),
      amount,
      description: desc,
      category:    'other',
      merchant:    desc.split(/\s+/)[0] || 'לא ידוע',
    })
  }

  return expenses
}
