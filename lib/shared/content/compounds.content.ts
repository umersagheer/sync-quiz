import type { BlendId, Compound } from '../types/engine.types'
import type { CompoundCopy } from '../types/content.types'

/**
 * Reveal card copy, per protocol.
 *
 * Almost all of this is still unwritten. The copy layer's own build notes say so
 * repeatedly — "Amelia to write the remaining 4 base paragraphs (PERFORM, DEFINE,
 * RESTORE, PT-141) and the 4 benefit chips per compound", and again for every supporting
 * protocol pairing. Two worked examples exist and both are reproduced verbatim below.
 *
 * Everything else is `pending`, and deliberately so. These chips and paragraphs are
 * therapeutic claims about compounded 503A molecules; the copy layer records that Reid
 * signs the associative framing and Amelia signs the paragraphs. Inventing plausible
 * substitutes would put unsigned medical claims in front of a customer, or into a client
 * deck as though approved. `docs/COPY_BACKLOG.md` lists exactly what is outstanding.
 *
 * Prices: every figure in the copy layer is a `$X` placeholder. The figures below come
 * from the confirmed Figma reveal frames and cover the Recovery lane only.
 *
 * Phase 5 harvested real chips, form lines and paragraphs for BPC-157, TB-500 and the
 * REPAIR blend out of those frames. That copy is client-authored but came from the
 * design rather than the signed copy layer, and in two places it contradicts it — the
 * blend is drawn as two compounds rather than four, and its paragraph is different
 * wording entirely. The frames are the newer, confirmed artefact so they win; both
 * divergences are logged in docs/COPY_BACKLOG.md.
 */

const pending = (awaiting: string): CompoundCopy['card'] => ({ status: 'pending', awaiting })

export const BLEND_COPY: Record<BlendId, CompoundCopy> = {
  REPAIR: {
    displayName: 'REPAIR BLEND',
    formLine: 'BPC-157 + TB-500 · single vial · 12-week cycle',
    card: {
      status: 'written',
      chips: ['Tissue repair', 'Gut lining', 'Joint integrity', 'Recovery depth'],
      paragraph:
        'A tendon that has not settled in six to twelve months, with broken sleep alongside it. The blend runs both signals from one vial, which is why nothing else is added here.',
    },
    monthlyPrice: 340,
    image: '/protocols/recovery-vial.webp',
  },
  PERFORM: {
    displayName: 'PERFORM',
    card: pending('4 benefit chips + 3-line base paragraph'),
    monthlyPrice: null,
  },
  DEFINE: {
    displayName: 'DEFINE',
    card: pending('4 benefit chips + 3-line base paragraph'),
    monthlyPrice: null,
  },
  RESTORE: {
    displayName: 'RESTORE',
    card: pending('4 benefit chips + 3-line base paragraph'),
    monthlyPrice: null,
  },
}

export const COMPOUND_COPY: Record<Compound, CompoundCopy> = {
  'NAD+': {
    displayName: 'NAD+',
    card: {
      status: 'written',
      chips: [
        '⚡ Cellular energy',
        '🧬 Mitochondrial function',
        '🔄 Recovery signalling',
        '🕐 Anti-fatigue',
      ],
      paragraph:
        "You also flagged energy — that's a separate system, running low. NAD+ powers the fuel your cells run on. Paired with REPAIR, it means the repair machinery has something to work with.",
    },
    monthlyPrice: null,
  },
  'BPC-157': {
    displayName: 'BPC-157',
    formLine: 'Injection · 5mg vial · 12-week cycle',
    card: {
      status: 'written',
      chips: ['Tissue repair', 'Gut lining', 'Joint integrity', 'Recovery depth'],
      paragraph:
        'A tendon that has not settled in six to twelve months, with broken sleep alongside it. BPC-157 signals repair at the site instead of adding load to a system already carrying plenty.',
    },
    // The recommend-less reveal argues the opposite case, so it gets its own paragraph.
    paragraphByShape: {
      SHAPE_1_SINGLE:
        'One site, under a year, with nothing else pulling on it. BPC-157 on its own is enough to signal repair there — adding a second compound would not make it faster.',
    },
    monthlyPrice: 225,
    image: '/protocols/recovery-vial.webp',
  },
  'TB-500': {
    displayName: 'TB-500',
    formLine: 'Injection · 5mg vial · runs with your base',
    card: {
      status: 'written',
      chips: ['Systemic reach', 'Flexibility', 'Inflammation', 'Cycle support'],
      paragraph:
        'You flagged stiffness in more than one place. TB-500 extends reach beyond the primary site, which is why it pairs here rather than standing on its own.',
    },
    monthlyPrice: 185,
    image: '/protocols/recovery-vial.webp',
  },
  KPV: {
    displayName: 'KPV',
    card: pending('4 benefit chips + 3-line paragraph'),
    monthlyPrice: null,
  },
  'GHK-Cu': {
    displayName: 'GHK-Cu',
    card: pending('4 benefit chips + 3-line paragraph'),
    monthlyPrice: null,
  },
  Epitalon: {
    displayName: 'Epitalon',
    card: pending('4 benefit chips + 3-line paragraph'),
    monthlyPrice: null,
  },
  Sermorelin: {
    displayName: 'Sermorelin',
    card: pending('4 benefit chips + 3-line paragraph'),
    monthlyPrice: null,
  },
  'CJC-1295': {
    displayName: 'CJC-1295',
    card: pending('4 benefit chips + 3-line paragraph'),
    monthlyPrice: null,
  },
  Ipamorelin: {
    displayName: 'Ipamorelin',
    card: pending('4 benefit chips + 3-line paragraph'),
    monthlyPrice: null,
  },
  'AOD-9604': {
    displayName: 'AOD-9604',
    card: pending('4 benefit chips + 3-line paragraph'),
    monthlyPrice: null,
  },
  Tesamorelin: {
    displayName: 'Tesamorelin',
    card: pending('4 benefit chips + 3-line paragraph'),
    monthlyPrice: null,
  },
  'MOTS-c': {
    displayName: 'MOTS-c',
    card: pending('4 benefit chips + 3-line paragraph'),
    monthlyPrice: null,
  },
  'PT-141': {
    displayName: 'PT-141',
    card: pending('4 benefit chips + 3-line paragraph'),
    monthlyPrice: null,
  },
  Semaglutide: {
    displayName: 'Semaglutide',
    card: pending('continuation-single copy — customer is already on a GLP-1'),
    monthlyPrice: null,
  },
  Tirzepatide: {
    displayName: 'Tirzepatide',
    card: pending('continuation-single copy — customer is already on a GLP-1'),
    monthlyPrice: null,
  },
}

/**
 * §5.6 — the one-line clinical reason shown on a pairs-well-with card. All four are
 * outstanding; the pairings themselves are locked in Backend §4A.
 */
export const PAIRS_WELL_WITH_REASON: Record<BlendId, string | null> = {
  REPAIR: null,
  PERFORM: null,
  DEFINE: null,
  RESTORE: null,
}
