// PDF.js loaded from CDN — no npm install needed
const PDFJS_URL    = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.mjs'
const WORKER_URL   = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

let _lib = null

async function getPdfjs() {
  if (_lib) return _lib
  _lib = await import(/* @vite-ignore */ PDFJS_URL)
  _lib.GlobalWorkerOptions.workerSrc = WORKER_URL
  return _lib
}

// ── Extract raw text from PDF file ────────────────────────────
export async function extractTextFromPDF(file) {
  const lib = await getPdfjs()
  const buffer = await file.arrayBuffer()
  const pdf    = await lib.getDocument({ data: buffer }).promise

  const pageTexts = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page    = await pdf.getPage(i)
    const content = await page.getTextContent()
    // keep items sorted by Y then X so lines read left-to-right
    const sorted  = [...content.items].sort((a, b) =>
      Math.round(b.transform[5] / 5) * 5 - Math.round(a.transform[5] / 5) * 5 ||
      a.transform[4] - b.transform[4]
    )
    pageTexts.push(sorted.map(it => it.str).join(' '))
  }
  return pageTexts.join('\n')
}

// ── Parse transaction rows from extracted text ────────────────
export function parseTransactionsFromText(text) {
  const lines    = text.split(/[\n\r]+/).map(l => l.trim()).filter(Boolean)
  const expenses = []

  // Patterns
  const dateRx   = /\b(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{2,4})\b/
  const amountRx = /\b(\d{1,6}(?:,\d{3})*(?:\.\d{1,2})?)\b/g

  for (const line of lines) {
    const dateMatch = line.match(dateRx)
    if (!dateMatch) continue

    // Collect all number-like tokens as candidate amounts
    const amounts = [...line.matchAll(amountRx)]
      .map(m => parseFloat(m[1].replace(/,/g, '')))
      .filter(n => n >= 1 && n < 100_000)

    if (amounts.length === 0) continue

    // Heuristic: largest number that isn't the year is the amount
    const year4 = dateMatch[3].length === 4 ? parseInt(dateMatch[3]) : null
    const amount = amounts
      .filter(n => n !== year4)
      .sort((a, b) => b - a)[0]

    if (!amount) continue

    // Description = everything except date tokens and the amount
    let desc = line
      .replace(dateRx, '')
      .replace(new RegExp(amount.toString().replace('.', '\\.'), 'g'), '')
      .replace(/[₪$€,]/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim()

    if (!desc || desc.length < 2) desc = 'עסקה'

    const day   = parseInt(dateMatch[1])
    const month = parseInt(dateMatch[2])
    const year  = dateMatch[3].length === 2
      ? 2000 + parseInt(dateMatch[3])
      : parseInt(dateMatch[3])

    if (month < 1 || month > 12 || day < 1 || day > 31) continue
    if (year < 2000 || year > 2030) continue

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
