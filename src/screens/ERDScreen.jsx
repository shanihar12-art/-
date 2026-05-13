import { useState } from 'react'
import { motion } from 'framer-motion'

// ── Canvas size ───────────────────────────────────────────────
const W = 1700
const H = 1020

// Shape sizes – bigger & clearer
const EW  = 160   // entity rect width
const EH  = 56    // entity rect height
const DX  = 88    // diamond half-width
const DY  = 44    // diamond half-height
const ARX = 66    // ellipse x-radius
const ARY = 28    // ellipse y-radius

// ── Entities ─────────────────────────────────────────────────
const ENTITIES = [
  { id: 'user',      label: 'User',       labelHe: 'משתמש',      x: 170,  y: 210  },
  { id: 'upload',    label: 'UploadFile', labelHe: 'קובץ העלאה',  x: 700,  y: 210  },
  { id: 'expense',   label: 'Expense',    labelHe: 'הוצאה',       x: 1290, y: 210  },
  { id: 'category',  label: 'Category',   labelHe: 'קטגוריה',     x: 1520, y: 530  },
  { id: 'dashboard', label: 'Dashboard',  labelHe: 'לוח בקרה',    x: 700,  y: 830  },
  { id: 'insight',   label: 'Insight',    labelHe: 'תובנה',       x: 1290, y: 830  },
]

// ── Relationships ─────────────────────────────────────────────
const RELATIONSHIPS = [
  { id: 'uploads',     label: 'UPLOADS',    labelHe: 'מעלה',    x: 435,  y: 210,  e1: 'user',      e2: 'upload',    c1: '1', c2: 'N' },
  { id: 'contains',    label: 'CONTAINS',   labelHe: 'מכיל',    x: 995,  y: 210,  e1: 'upload',    e2: 'expense',   c1: '1', c2: 'N' },
  { id: 'belongs_to',  label: 'BELONGS TO', labelHe: 'שייך ל',  x: 1405, y: 370,  e1: 'expense',   e2: 'category',  c1: 'N', c2: '1' },
  { id: 'generates',   label: 'GENERATES',  labelHe: 'מייצר',   x: 700,  y: 520,  e1: 'upload',    e2: 'dashboard', c1: '1', c2: '1' },
  { id: 'has_insight', label: 'HAS',        labelHe: 'כולל',    x: 995,  y: 830,  e1: 'dashboard', e2: 'insight',   c1: '1', c2: 'N' },
]

// ── Attributes ────────────────────────────────────────────────
const ATTRIBUTES = {
  user: [
    { id: 'u_id',    label: 'userID',     pk: true, dx: -190, dy: -95  },
    { id: 'u_name',  label: 'name',                 dx: -195, dy:  15  },
    { id: 'u_email', label: 'email',                dx: -190, dy: 115  },
    { id: 'u_pass',  label: 'password',             dx:  -80, dy: -135 },
  ],
  upload: [
    { id: 'up_id',   label: 'fileID',     pk: true, dx:    0, dy: -130 },
    { id: 'up_name', label: 'fileName',             dx:  155, dy: -110 },
    { id: 'up_date', label: 'uploadDate',           dx:  185, dy:    0 },
    { id: 'up_type', label: 'fileType',             dx:  155, dy:  100 },
  ],
  expense: [
    { id: 'ex_id',   label: 'expenseID',  pk: true, dx:  190, dy:  -95 },
    { id: 'ex_amt',  label: 'amount',               dx:  195, dy:   15 },
    { id: 'ex_date', label: 'date',                 dx:  190, dy:  115 },
    { id: 'ex_desc', label: 'description',          dx:   80, dy: -135 },
  ],
  category: [
    { id: 'cat_id',   label: 'catID',     pk: true, dx:  185, dy:  -75 },
    { id: 'cat_name', label: 'name',                dx:  185, dy:   55 },
    { id: 'cat_icon', label: 'icon',                dx:   90, dy:  130 },
  ],
  dashboard: [
    { id: 'db_id',    label: 'dashID',    pk: true, dx: -190, dy:  105 },
    { id: 'db_total', label: 'totalSpend',          dx: -195, dy:  -15 },
    { id: 'db_score', label: 'score',               dx:  -80, dy:  135 },
    { id: 'db_month', label: 'monthName',           dx:   80, dy:  135 },
  ],
  insight: [
    { id: 'in_id',   label: 'insightID',  pk: true, dx:  190, dy:  105 },
    { id: 'in_type', label: 'type',                 dx:  195, dy:  -15 },
    { id: 'in_text', label: 'content',              dx:   80, dy:  135 },
  ],
}

// ── Clip helpers ──────────────────────────────────────────────
function clipToRect(cx, cy, tx, ty) {
  const dx = tx - cx, dy = ty - cy
  if (!dx && !dy) return { x: cx, y: cy }
  const t = Math.min(
    dx !== 0 ? (EW / 2) / Math.abs(dx) : Infinity,
    dy !== 0 ? (EH / 2) / Math.abs(dy) : Infinity
  )
  return { x: cx + dx * t, y: cy + dy * t }
}

function clipToDiamond(cx, cy, tx, ty) {
  const dx = tx - cx, dy = ty - cy
  const d = Math.sqrt(dx * dx + dy * dy)
  if (!d) return { x: cx, y: cy }
  const nx = dx / d, ny = dy / d
  const t = 1 / (Math.abs(nx) / DX + Math.abs(ny) / DY)
  return { x: cx + nx * t, y: cy + ny * t }
}

function clipToEllipse(cx, cy, tx, ty) {
  const dx = tx - cx, dy = ty - cy
  const d = Math.sqrt(dx * dx + dy * dy)
  if (!d) return { x: cx, y: cy }
  const nx = dx / d, ny = dy / d
  const t = 1 / Math.sqrt((nx / ARX) ** 2 + (ny / ARY) ** 2)
  return { x: cx + nx * t, y: cy + ny * t }
}

function entityCenter(id) {
  const e = ENTITIES.find(e => e.id === id)
  return { x: e.x, y: e.y }
}

// ── Sub-components ────────────────────────────────────────────
function EntityRect({ entity, hovered, onHover }) {
  const { x, y, label, labelHe } = entity
  const active = hovered === entity.id
  return (
    <g onMouseEnter={() => onHover(entity.id)} onMouseLeave={() => onHover(null)} style={{ cursor: 'default' }}>
      <rect
        x={x - EW / 2} y={y - EH / 2} width={EW} height={EH} rx={5}
        fill={active ? 'rgba(212,175,55,0.22)' : 'rgba(212,175,55,0.09)'}
        stroke={active ? '#D4AF37' : 'rgba(212,175,55,0.6)'}
        strokeWidth={active ? 2.5 : 1.8}
        style={{ filter: active ? 'drop-shadow(0 0 10px rgba(212,175,55,0.5))' : 'none', transition: 'all 0.2s' }}
      />
      <text x={x} y={y - 7} textAnchor="middle" fill="#F1F5F9"
        fontSize={15} fontWeight="800" fontFamily="Heebo, sans-serif">
        {label}
      </text>
      <text x={x} y={y + 12} textAnchor="middle" fill="#94A3B8"
        fontSize={12} fontFamily="Heebo, sans-serif">
        {labelHe}
      </text>
    </g>
  )
}

function RelDiamond({ rel, hovered, onHover }) {
  const { x, y, label, labelHe } = rel
  const active = hovered === rel.id
  const pts = `${x},${y - DY} ${x + DX},${y} ${x},${y + DY} ${x - DX},${y}`
  return (
    <g onMouseEnter={() => onHover(rel.id)} onMouseLeave={() => onHover(null)} style={{ cursor: 'default' }}>
      <polygon
        points={pts}
        fill={active ? 'rgba(14,165,233,0.22)' : 'rgba(14,165,233,0.08)'}
        stroke={active ? '#0EA5E9' : 'rgba(14,165,233,0.55)'}
        strokeWidth={active ? 2.5 : 1.8}
        style={{ filter: active ? 'drop-shadow(0 0 10px rgba(14,165,233,0.5))' : 'none', transition: 'all 0.2s' }}
      />
      <text x={x} y={y - 5} textAnchor="middle" fill="#7DD3FC"
        fontSize={11} fontWeight="800" fontFamily="Heebo, sans-serif" letterSpacing="0.5">
        {label}
      </text>
      <text x={x} y={y + 10} textAnchor="middle" fill="#64748B"
        fontSize={10} fontFamily="Heebo, sans-serif">
        {labelHe}
      </text>
    </g>
  )
}

function AttrEllipse({ attr, ex, ey, hovered, onHover }) {
  const ax = ex + attr.dx
  const ay = ey + attr.dy
  const active = hovered === attr.id
  const isPK = !!attr.pk

  const eEdge = clipToRect(ex, ey, ax, ay)
  const aEdge = clipToEllipse(ax, ay, ex, ey)
  const ty = ay + (isPK ? -2 : 6)

  return (
    <g onMouseEnter={() => onHover(attr.id)} onMouseLeave={() => onHover(null)} style={{ cursor: 'default' }}>
      <line
        x1={eEdge.x} y1={eEdge.y} x2={aEdge.x} y2={aEdge.y}
        stroke="rgba(148,163,184,0.3)" strokeWidth={1.2}
      />
      <ellipse
        cx={ax} cy={ay} rx={ARX} ry={ARY}
        fill={active ? 'rgba(16,185,129,0.18)' : 'rgba(16,185,129,0.07)'}
        stroke={active ? '#10B981' : 'rgba(16,185,129,0.42)'}
        strokeWidth={active ? 1.8 : 1.2}
        style={{ transition: 'all 0.2s' }}
      />
      <text x={ax} y={ty} textAnchor="middle"
        fill={isPK ? '#F1F5F9' : '#94A3B8'}
        fontSize={11} fontWeight={isPK ? '700' : '400'}
        fontFamily="Heebo, sans-serif">
        {attr.label}
      </text>
      {isPK && (
        <line
          x1={ax - 30} y1={ty + 5}
          x2={ax + 30} y2={ty + 5}
          stroke="#F1F5F9" strokeWidth={1.4}
        />
      )}
    </g>
  )
}

function RelLine({ rel }) {
  const e1 = entityCenter(rel.e1)
  const e2 = entityCenter(rel.e2)
  const rc = { x: rel.x, y: rel.y }

  const p1 = clipToRect(e1.x, e1.y, rc.x, rc.y)
  const d1 = clipToDiamond(rc.x, rc.y, e1.x, e1.y)
  const p2 = clipToRect(e2.x, e2.y, rc.x, rc.y)
  const d2 = clipToDiamond(rc.x, rc.y, e2.x, e2.y)

  const dist1 = Math.hypot(rc.x - e1.x, rc.y - e1.y) || 1
  const dist2 = Math.hypot(rc.x - e2.x, rc.y - e2.y) || 1
  const off = 26
  const c1x = p1.x + (rc.x - e1.x) / dist1 * off
  const c1y = p1.y + (rc.y - e1.y) / dist1 * off
  const c2x = p2.x + (rc.x - e2.x) / dist2 * off
  const c2y = p2.y + (rc.y - e2.y) / dist2 * off

  return (
    <g>
      <line x1={p1.x} y1={p1.y} x2={d1.x} y2={d1.y} stroke="rgba(148,163,184,0.4)" strokeWidth={1.8} />
      <line x1={p2.x} y1={p2.y} x2={d2.x} y2={d2.y} stroke="rgba(148,163,184,0.4)" strokeWidth={1.8} />
      {/* Cardinality labels */}
      <text x={c1x} y={c1y - 5} textAnchor="middle" fill="#D4AF37"
        fontSize={15} fontWeight="800" fontFamily="Heebo, sans-serif">
        {rel.c1}
      </text>
      <text x={c2x} y={c2y - 5} textAnchor="middle" fill="#D4AF37"
        fontSize={15} fontWeight="800" fontFamily="Heebo, sans-serif">
        {rel.c2}
      </text>
    </g>
  )
}

// ── Main ──────────────────────────────────────────────────────
export default function ERDScreen() {
  const [hovered, setHovered] = useState(null)
  const [zoom, setZoom]       = useState(0.88)
  const [pan, setPan]         = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState(null)

  const onMouseDown = e => {
    if (e.button !== 0) return
    setDragging(true)
    setDragStart({ mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y })
  }
  const onMouseMove = e => {
    if (!dragging || !dragStart) return
    setPan({ x: dragStart.px + e.clientX - dragStart.mx, y: dragStart.py + e.clientY - dragStart.my })
  }
  const onMouseUp = () => { setDragging(false); setDragStart(null) }
  const onWheel = e => {
    e.preventDefault()
    setZoom(z => Math.min(3, Math.max(0.3, z - e.deltaY * 0.001)))
  }

  const vx = -pan.x / zoom
  const vy = -pan.y / zoom
  const vw = W / zoom
  const vh = H / zoom

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: '#080B14' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}>

        <div>
          <h1 className="text-xl font-bold" style={{ color: '#F1F5F9' }}>
            תרשים <span className="gold-text">ERD</span>
          </h1>
          <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
            Chen Notation — ישויות · קשרים · תכונות
          </p>
        </div>

        <div className="flex items-center gap-6">
          {/* Legend */}
          <div className="flex items-center gap-4 text-xs" style={{ color: '#64748B' }}>
            <div className="flex items-center gap-1.5">
              <svg width="32" height="20">
                <rect x="2" y="4" width="28" height="14" rx="2" fill="none" stroke="rgba(212,175,55,0.65)" strokeWidth="1.8"/>
              </svg>
              <span>ישות</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg width="38" height="24">
                <polygon points="19,2 36,12 19,22 2,12" fill="none" stroke="rgba(14,165,233,0.65)" strokeWidth="1.8"/>
              </svg>
              <span>קשר</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg width="38" height="24">
                <ellipse cx="19" cy="12" rx="17" ry="9" fill="none" stroke="rgba(16,185,129,0.55)" strokeWidth="1.5"/>
              </svg>
              <span>תכונה</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg width="42" height="24">
                <ellipse cx="21" cy="12" rx="19" ry="9" fill="none" stroke="rgba(16,185,129,0.55)" strokeWidth="1.5"/>
                <text x="21" y="14" textAnchor="middle" fill="#F1F5F9" fontSize="8" fontWeight="700">PK</text>
                <line x1="9" y1="18" x2="33" y2="18" stroke="#F1F5F9" strokeWidth="1.3"/>
              </svg>
              <span>מפתח ראשי</span>
            </div>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1">
            <button onClick={() => setZoom(z => Math.min(3, z + 0.15))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-base font-bold transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#94A3B8' }}
              onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
              onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}>+</button>
            <span className="text-xs w-11 text-center" style={{ color: '#475569' }}>
              {Math.round(zoom * 100)}%
            </span>
            <button onClick={() => setZoom(z => Math.max(0.3, z - 0.15))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-base font-bold transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#94A3B8' }}
              onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
              onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}>−</button>
            <button onClick={() => { setZoom(0.88); setPan({ x: 0, y: 0 }) }}
              className="text-xs px-2.5 h-8 rounded-lg ml-1 transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#94A3B8' }}
              onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
              onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}>
              איפוס
            </button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-hidden"
        style={{ cursor: dragging ? 'grabbing' : 'grab' }}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove}
        onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
        onWheel={onWheel}>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }} style={{ width: '100%', height: '100%' }}>

          <svg width="100%" height="100%"
            viewBox={`${vx} ${vy} ${vw} ${vh}`}
            style={{ display: 'block' }}>

            <defs>
              <radialGradient id="erdBg" cx="50%" cy="40%" r="75%">
                <stop offset="0%"   stopColor="#0E1420"/>
                <stop offset="100%" stopColor="#080B14"/>
              </radialGradient>
            </defs>

            {/* Background */}
            <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#erdBg)"/>

            {/* Grid dots */}
            {Array.from({ length: 20 }, (_, r) =>
              Array.from({ length: 32 }, (_, c) => (
                <circle key={`${r}-${c}`}
                  cx={c * 54 + 27} cy={r * 54 + 27} r={1.2}
                  fill="rgba(255,255,255,0.04)"/>
              ))
            )}

            {/* Draw order: lines → attributes → diamonds → entities */}
            {RELATIONSHIPS.map(r => <RelLine key={r.id} rel={r} />)}

            {ENTITIES.map(entity =>
              (ATTRIBUTES[entity.id] || []).map(attr => (
                <AttrEllipse key={attr.id} attr={attr}
                  ex={entity.x} ey={entity.y}
                  hovered={hovered} onHover={setHovered} />
              ))
            )}

            {RELATIONSHIPS.map(r => (
              <RelDiamond key={r.id} rel={r} hovered={hovered} onHover={setHovered} />
            ))}

            {ENTITIES.map(entity => (
              <EntityRect key={entity.id} entity={entity} hovered={hovered} onHover={setHovered} />
            ))}
          </svg>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="px-6 py-2 border-t text-center text-xs flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.04)', color: '#334155' }}>
        גרור להזזה · גלגלת עכבר לזום
      </div>
    </div>
  )
}
