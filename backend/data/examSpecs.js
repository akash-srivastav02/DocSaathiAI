// All dimensions in pixels. Sizes in KB.
const examSpecs = {
  // ── SSC ──────────────────────────────────────────────────
  'SSC CGL': {
    photo:     { w: 200, h: 230, minKB: 20, maxKB: 50  },
    signature: { w: 200, h:  70, minKB: 10, maxKB: 20  },
  },
  'SSC CHSL': {
    photo:     { w: 200, h: 230, minKB: 20, maxKB: 50  },
    signature: { w: 200, h:  70, minKB: 10, maxKB: 20  },
  },
  'SSC MTS': {
    photo:     { w: 200, h: 230, minKB: 20, maxKB: 50  },
    signature: { w: 200, h:  70, minKB: 10, maxKB: 20  },
  },
  'SSC GD': {
    photo:     { w: 200, h: 230, minKB: 20, maxKB: 50  },
    signature: { w: 200, h:  70, minKB: 10, maxKB: 20  },
  },
  // ── SBI / IBPS ───────────────────────────────────────────
  'SBI PO': {
    photo:     { w: 200, h: 200, minKB: 20, maxKB: 50  },
    signature: { w: 200, h:  80, minKB: 10, maxKB: 20  },
  },
  'SBI Clerk': {
    photo:     { w: 200, h: 200, minKB: 20, maxKB: 50  },
    signature: { w: 200, h:  80, minKB: 10, maxKB: 20  },
  },
  'IBPS PO': {
    photo:     { w: 200, h: 230, minKB: 20, maxKB: 50  },
    signature: { w: 200, h:  80, minKB: 10, maxKB: 20  },
  },
  'IBPS Clerk': {
    photo:     { w: 200, h: 230, minKB: 20, maxKB: 50  },
    signature: { w: 200, h:  80, minKB: 10, maxKB: 20  },
  },
  'IBPS RRB': {
    photo:     { w: 200, h: 230, minKB: 20, maxKB: 50  },
    signature: { w: 200, h:  80, minKB: 10, maxKB: 20  },
  },
  // ── Railway ──────────────────────────────────────────────
  'RRB NTPC': {
    photo:     { w: 200, h: 230, minKB: 20, maxKB: 50  },
    signature: { w: 200, h:  70, minKB: 10, maxKB: 20  },
  },
  'RRB Group D': {
    photo:     { w: 200, h: 230, minKB: 20, maxKB: 50  },
    signature: { w: 200, h:  70, minKB: 10, maxKB: 20  },
  },
  'RRB JE': {
    photo:     { w: 200, h: 230, minKB: 20, maxKB: 50  },
    signature: { w: 200, h:  70, minKB: 10, maxKB: 20  },
  },
  // ── Engineering / Medical ─────────────────────────────────
  'JEE Main': {
    photo:     { w: 236, h: 295, minKB: 10, maxKB: 200 },
    signature: { w: 300, h:  80, minKB:  4, maxKB:  30 },
  },
  'JEE Advanced': {
    photo:     { w: 236, h: 295, minKB: 10, maxKB: 200 },
    signature: { w: 300, h:  80, minKB:  4, maxKB:  30 },
  },
  'NEET UG': {
    photo:     { w: 236, h: 295, minKB: 10, maxKB: 200 },
    signature: { w: 300, h:  80, minKB:  4, maxKB:  30 },
  },
  'CUET UG': {
    photo:     { w: 200, h: 230, minKB: 10, maxKB: 300 },
    signature: { w: 200, h:  80, minKB:  4, maxKB:  50 },
  },
  // ── UPSC ─────────────────────────────────────────────────
  'UPSC CSE': {
    photo:     { w: 200, h: 230, minKB: 20, maxKB: 300 },
    signature: { w: 200, h:  80, minKB: 10, maxKB: 100 },
  },
  'UPSC CDS': {
    photo:     { w: 200, h: 230, minKB: 20, maxKB: 300 },
    signature: { w: 200, h:  80, minKB: 10, maxKB: 100 },
  },
  'UPSC NDA': {
    photo:     { w: 200, h: 230, minKB: 20, maxKB: 300 },
    signature: { w: 200, h:  80, minKB: 10, maxKB: 100 },
  },
  // ── Police ───────────────────────────────────────────────
  'Delhi Police Constable': {
    photo:     { w: 200, h: 230, minKB: 20, maxKB: 50  },
    signature: { w: 200, h:  70, minKB: 10, maxKB: 20  },
  },
  'Delhi Police SI': {
    photo:     { w: 200, h: 230, minKB: 20, maxKB: 50  },
    signature: { w: 200, h:  70, minKB: 10, maxKB: 20  },
  },
  'UP Police': {
    photo:     { w: 200, h: 230, minKB: 20, maxKB: 50  },
    signature: { w: 200, h:  70, minKB: 10, maxKB: 20  },
  },
  // ── Defence ──────────────────────────────────────────────
  'NDA': {
    photo:     { w: 200, h: 230, minKB: 20, maxKB: 300 },
    signature: { w: 200, h:  80, minKB: 10, maxKB: 100 },
  },
  'AFCAT': {
    photo:     { w: 200, h: 230, minKB: 20, maxKB: 300 },
    signature: { w: 200, h:  80, minKB: 10, maxKB: 100 },
  },
  // ── LIC / Insurance ──────────────────────────────────────
  'LIC AAO': {
    photo:     { w: 200, h: 230, minKB: 20, maxKB: 50  },
    signature: { w: 200, h:  80, minKB: 10, maxKB: 20  },
  },
  // ── GATE ─────────────────────────────────────────────────
  'GATE': {
    photo:     { w: 236, h: 295, minKB: 10, maxKB: 500 },
    signature: { w: 300, h:  80, minKB:  4, maxKB: 100 },
  },
};

module.exports = examSpecs;