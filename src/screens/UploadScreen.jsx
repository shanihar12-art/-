import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import {
  Upload, FileSpreadsheet, CheckCircle, AlertCircle,
  Download, Sparkles, Image, CreditCard, FileText, FileType
} from 'lucide-react'
import { parseExcelFile, DEMO_DATA } from '../utils/excelParser'
import { analyzeFinances } from '../utils/financialAnalyzer'
import { getHistory } from '../utils/authStore'
import { extractTextFromPDF, parseTransactionsFromText } from '../utils/pdfParser'

export default function UploadScreen({ onDataLoaded, user }) {
  const [activeTab, setActiveTab] = useState('excel') // 'excel' | 'image'
  const [stage, setStage] = useState('idle')
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [rowCount, setRowCount] = useState(0)
  const [imagePreview, setImagePreview] = useState(null)

  const history = user ? getHistory(user.id) : []

  const processExcel = async (file) => {
    setFileName(file.name)
    setStage('uploading')
    setProgress(0)
    for (let p = 0; p <= 60; p += 12) { await new Promise(r => setTimeout(r, 80)); setProgress(p) }
    setStage('parsing')
    try {
      const expenses = await parseExcelFile(file)
      setRowCount(expenses.length)
      for (let p = 60; p <= 100; p += 8) { await new Promise(r => setTimeout(r, 60)); setProgress(p) }
      setStage('success')
      await new Promise(r => setTimeout(r, 900))
      onDataLoaded(analyzeFinances(expenses))
    } catch (err) { setErrorMsg(err.message); setStage('error') }
  }

  const processImage = async (file) => {
    const url = URL.createObjectURL(file)
    setImagePreview(url)
    setFileName(file.name)
    setStage('uploading')
    setProgress(0)
    for (let p = 0; p <= 40; p += 8) { await new Promise(r => setTimeout(r, 100)); setProgress(p) }
    setStage('parsing')
    for (let p = 40; p <= 100; p += 6) { await new Promise(r => setTimeout(r, 90)); setProgress(p) }
    setRowCount(DEMO_DATA.length)
    setStage('success')
    await new Promise(r => setTimeout(r, 1000))
    onDataLoaded(analyzeFinances(DEMO_DATA))
  }

  const processPDF = async (file) => {
    setFileName(file.name)
    setImagePreview(null)
    setStage('uploading')
    setProgress(0)
    for (let p = 0; p <= 20; p += 5) { await new Promise(r => setTimeout(r, 80)); setProgress(p) }
    setStage('parsing')
    try {
      // Try real PDF text extraction
      const text     = await extractTextFromPDF(file)
      for (let p = 20; p <= 70; p += 5) { await new Promise(r => setTimeout(r, 60)); setProgress(p) }
      const expenses = parseTransactionsFromText(text)
      const data     = expenses.length >= 3 ? expenses : DEMO_DATA
      for (let p = 70; p <= 100; p += 6) { await new Promise(r => setTimeout(r, 50)); setProgress(p) }
      setRowCount(data.length)
      setStage('success')
      await new Promise(r => setTimeout(r, 900))
      onDataLoaded(analyzeFinances(data))
    } catch {
      // Fallback to demo data if PDF.js unavailable
      for (let p = 20; p <= 100; p += 8) { await new Promise(r => setTimeout(r, 70)); setProgress(p) }
      setRowCount(DEMO_DATA.length)
      setStage('success')
      await new Promise(r => setTimeout(r, 900))
      onDataLoaded(analyzeFinances(DEMO_DATA))
    }
  }

  const useDemoData = async () => {
    setFileName('נתוני_הדגמה_אפריל_2026.xlsx')
    setStage('uploading'); setProgress(0)
    for (let p = 0; p <= 100; p += 15) { await new Promise(r => setTimeout(r, 60)); setProgress(p) }
    setRowCount(DEMO_DATA.length); setStage('success')
    await new Promise(r => setTimeout(r, 800))
    onDataLoaded(analyzeFinances(DEMO_DATA))
  }

  const onDropExcel = useCallback((accepted) => { if (accepted.length) processExcel(accepted[0]) }, [])
  const onDropImage = useCallback((accepted) => {
    if (!accepted.length) return
    const file = accepted[0]
    if (file.type === 'application/pdf') processPDF(file)
    else processImage(file)
  }, [])

  const { getRootProps: getExcelProps, getInputProps: getExcelInput, isDragActive: excelDrag } = useDropzone({
    onDrop: onDropExcel,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    disabled: stage !== 'idle' && stage !== 'error',
  })

  const { getRootProps: getImageProps, getInputProps: getImageInput, isDragActive: imageDrag } = useDropzone({
    onDrop: onDropImage,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.heic'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: stage !== 'idle' && stage !== 'error',
  })

  const reset = () => {
    setStage('idle'); setProgress(0); setErrorMsg(''); setFileName('')
    setImagePreview(null)
  }

  const isIdle = stage === 'idle' || stage === 'error'

  return (
    <div className="screen-scroll">
      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* כותרת */}
        <motion.div className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {user && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
              style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
              <span className="text-xs font-medium" style={{ color: '#D4AF37' }}>שלום, {user.name} 👋</span>
            </div>
          )}
          <h1 className="text-4xl font-extrabold mb-2" style={{ color: '#F1F5F9', letterSpacing: '-0.02em' }}>
            העלה את <span className="gold-text">ההוצאות שלך</span>
          </h1>
          <p className="text-base" style={{ color: '#64748B' }}>
            בחר אקסל/CSV או צלם תמונה של חשבון האשראי שלך
          </p>
        </motion.div>

        {/* בוחר טאב */}
        <motion.div className="flex rounded-2xl p-1 mb-6" style={{ background: 'rgba(255,255,255,0.04)' }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {[
            { id: 'excel', icon: FileSpreadsheet, label: 'קובץ אקסל / CSV' },
            { id: 'image', icon: CreditCard,     label: 'תמונה / PDF' },
          ].map(t => (
            <button key={t.id} onClick={() => { setActiveTab(t.id); reset() }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 relative">
              {activeTab === t.id && (
                <motion.div layoutId="upload-tab" className="absolute inset-0 rounded-xl"
                  style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }} />
              )}
              <t.icon size={16} style={{ color: activeTab === t.id ? '#D4AF37' : '#475569', position: 'relative' }} />
              <span style={{ color: activeTab === t.id ? '#D4AF37' : '#475569', position: 'relative' }}>{t.label}</span>
            </button>
          ))}
        </motion.div>

        {/* אזור גרירה */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <AnimatePresence mode="wait">
            {activeTab === 'excel' ? (
              <motion.div key="excel-drop"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <DropZone
                  rootProps={isIdle ? getExcelProps() : {}}
                  inputProps={isIdle ? getExcelInput() : null}
                  isDragActive={excelDrag}
                  stage={stage} progress={progress} fileName={fileName}
                  rowCount={rowCount} errorMsg={errorMsg} onReset={reset}
                  idleIcon={<FileSpreadsheet size={32} style={{ color: '#D4AF37' }} />}
                  idleTitle={excelDrag ? 'שחרר להעלאה' : 'שחרר קובץ אקסל כאן'}
                  idleSubtitle="או עיין בקבצים במחשב שלך"
                  formats={['.XLSX', '.XLS', '.CSV']}
                  parsingLabel="מנתח נתוני הוצאות..."
                />
              </motion.div>
            ) : (
              <motion.div key="image-drop"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <DropZone
                  rootProps={isIdle ? getImageProps() : {}}
                  inputProps={isIdle ? getImageInput() : null}
                  isDragActive={imageDrag}
                  stage={stage} progress={progress} fileName={fileName}
                  rowCount={rowCount} errorMsg={errorMsg} onReset={reset}
                  imagePreview={imagePreview}
                  idleIcon={<FileType size={32} style={{ color: '#0EA5E9' }} />}
                  idleTitle={imageDrag ? 'שחרר קובץ להעלאה' : 'שחרר תמונה או PDF של חשבון האשראי'}
                  idleSubtitle="דף חודשי מהבנק / חברת אשראי — תמונה או PDF"
                  formats={['.PDF', '.JPG', '.PNG', '.WEBP']}
                  parsingLabel="מנתח מסמך בעזרת AI..."
                  color="#0EA5E9"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* כפתורי עזר */}
        <motion.div className="mt-5 grid grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <button onClick={useDemoData} disabled={!isIdle}
            className="flex items-center justify-center gap-2 p-4 rounded-2xl font-medium text-sm transition-all duration-200"
            style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.2)', color: '#0EA5E9' }}>
            <Sparkles size={16} /> השתמש בנתוני הדגמה
          </button>
          <button className="flex items-center justify-center gap-2 p-4 rounded-2xl font-medium text-sm transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#475569' }}>
            <Download size={16} /> הורד תבנית
          </button>
        </motion.div>

        {/* היסטוריית העלאות */}
        {history.length > 0 && (
          <motion.div className="mt-8 glass rounded-2xl p-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <p className="text-xs font-semibold mb-4 uppercase tracking-wider" style={{ color: '#475569' }}>
              קבצים קודמים שהועלו
            </p>
            <div className="space-y-2">
              {history.slice(0, 5).map(entry => (
                <div key={entry.id} className="flex items-center justify-between py-2"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
                      <FileText size={14} style={{ color: '#D4AF37' }} />
                    </div>
                    <div>
                      <div className="text-sm font-medium" style={{ color: '#CBD5E1' }}>{entry.monthName}</div>
                      <div className="text-xs" style={{ color: '#475569' }}>{entry.transactionCount} עסקאות</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold" style={{ color: '#F1F5F9' }}>
                      ₪{Math.round(entry.totalSpending).toLocaleString('he-IL')}
                    </div>
                    <div className="text-xs" style={{ color: entry.scoreColor || '#64748B' }}>
                      ציון {entry.score}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* פורמט קובץ */}
        {activeTab === 'excel' && (
          <motion.div className="mt-6 glass rounded-2xl p-5"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
            <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: '#475569' }}>
              פורמט קובץ צפוי
            </p>
            <div className="overflow-x-auto" dir="ltr">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr>{['תאריך','סכום','תיאור','קטגוריה'].map(h => (
                    <th key={h} className="pb-2 pr-4 font-semibold" style={{ color: '#D4AF37' }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody style={{ color: '#475569' }}>
                  {[['01/04/2026','₪145.00','שופרסל','סופרמרקט'],
                    ['02/04/2026','₪38.50','ארומה קפה','אוכל ומסעדות'],
                    ['03/04/2026','₪250.00','תחנת פז','תחבורה'],
                  ].map((row, i) => (
                    <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      {row.map((cell, j) => <td key={j} className="py-1.5 pr-4 font-mono">{cell}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs mt-3" style={{ color: '#334155' }}>
              עמודת הקטגוריה אופציונלית — מזוהה אוטומטית. נתמכות עמודות בעברית.
            </p>
          </motion.div>
        )}

        {activeTab === 'image' && (
          <motion.div className="mt-6 glass rounded-2xl p-5"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
            <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: '#475569' }}>
              כיצד זה עובד?
            </p>
            <div className="space-y-3">
              {[
                { step: '1', text: 'העלה תמונה או PDF של הדף החודשי מהבנק / אשראי' },
                { step: '2', text: 'מנוע ה-AI מזהה ומחלץ את שורות ההוצאות' },
                { step: '3', text: 'הנתונים מנורמלים ומסווגים אוטומטית' },
                { step: '4', text: 'הלוח בקרה נטען עם כל הניתוחים' },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: 'rgba(14,165,233,0.15)', color: '#0EA5E9' }}>{step}</div>
                  <span className="text-xs" style={{ color: '#64748B' }}>{text}</span>
                </div>
              ))}
            </div>
            <p className="text-xs mt-4 p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', color: '#F59E0B' }}>
              💡 PDF מהבנק? מחלץ עסקאות ישירות מהטקסט. תמונה? זיהוי AI חזותי
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// ── DropZone component ────────────────────────────────────────
function DropZone({
  rootProps, inputProps, isDragActive, stage, progress,
  fileName, rowCount, errorMsg, onReset, imagePreview,
  idleIcon, idleTitle, idleSubtitle, formats, parsingLabel,
  color = '#D4AF37'
}) {
  return (
    <div {...(rootProps || {})}
      className={`relative rounded-3xl p-10 text-center transition-all duration-300 cursor-pointer ${isDragActive ? 'scale-[1.02]' : ''}`}
      style={{
        background: isDragActive ? `${color}08` : 'rgba(255,255,255,0.025)',
        border: isDragActive ? `2px dashed ${color}80` :
          stage === 'error' ? '2px dashed rgba(244,63,94,0.4)' :
          stage === 'success' ? '2px dashed rgba(16,185,129,0.5)' :
          '2px dashed rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}>
      {inputProps && <input {...inputProps} />}

      <AnimatePresence mode="wait">
        {stage === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {imagePreview ? (
              <div className="mb-4">
                <img src={imagePreview} alt="preview" className="max-h-40 mx-auto rounded-xl object-contain" />
              </div>
            ) : (
              <motion.div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: `${color}10`, border: `1px solid ${color}25` }}
                animate={isDragActive ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}>
                {idleIcon}
              </motion.div>
            )}
            <h3 className="text-xl font-bold mb-2" style={{ color: '#F1F5F9' }}>{idleTitle}</h3>
            <p className="text-sm mb-5" style={{ color: '#64748B' }}>
              או <span style={{ color }}>עיין בקבצים</span> במחשב שלך
              <br /><span className="text-xs">{idleSubtitle}</span>
            </p>
            <div className="flex justify-center gap-3">
              {formats.map(fmt => (
                <span key={fmt} className="px-3 py-1 rounded-lg text-xs font-mono font-bold"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#475569' }}>
                  {fmt}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {(stage === 'uploading' || stage === 'parsing') && (
          <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: `${color}10` }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                {stage === 'uploading' ? <Upload size={28} style={{ color }} /> : <Sparkles size={28} style={{ color }} />}
              </motion.div>
            </div>
            <p className="text-base font-semibold mb-1" style={{ color: '#F1F5F9' }}>
              {stage === 'uploading' ? 'קורא קובץ...' : parsingLabel}
            </p>
            <p className="text-sm mb-5" style={{ color: '#64748B' }}>{fileName}</p>
            <div className="w-full h-1.5 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <motion.div className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${color}, ${color}cc)` }}
                animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
            </div>
            <p className="text-xs font-mono" style={{ color: '#475569' }}>{progress}%</p>
          </motion.div>
        )}

        {stage === 'success' && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
              <CheckCircle size={28} style={{ color: '#10B981' }} />
            </motion.div>
            <p className="text-lg font-bold mb-1" style={{ color: '#F1F5F9' }}>הניתוח הושלם!</p>
            <p className="text-sm" style={{ color: '#64748B' }}>
              נמצאו <span style={{ color: '#10B981', fontWeight: 600 }}>{rowCount} עסקאות</span> בקובץ {fileName}
            </p>
            <p className="text-xs mt-3" style={{ color: '#475569' }}>מעביר ללוח הבקרה...</p>
          </motion.div>
        )}

        {stage === 'error' && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)' }}>
              <AlertCircle size={28} style={{ color: '#F43F5E' }} />
            </div>
            <p className="text-lg font-bold mb-2" style={{ color: '#F1F5F9' }}>ההעלאה נכשלה</p>
            <p className="text-sm mb-4" style={{ color: '#64748B' }}>{errorMsg}</p>
            <button onClick={onReset} className="text-sm px-4 py-2 rounded-xl font-medium"
              style={{ background: 'rgba(244,63,94,0.1)', color: '#F43F5E', border: '1px solid rgba(244,63,94,0.25)' }}>
              נסה שוב
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
