import type { Compound } from '../types/engine.types'

/**
 * Formulary clearance.
 *
 * The engine filters candidates against this table before assembling a result,
 * so a compound that loses clearance can never reach a customer. When the
 * cleared set changes, edit this file only.
 *
 * `blendEligible: false` marks compounds that are valid as a standalone result
 * but must never appear inside an advanced blend — GLP-1 medications are
 * standalone 503A only.
 */
export interface FormularyEntry {
  cleared: boolean
  blendEligible: boolean
  note?: string
}

export const FORMULARY: Record<Compound, FormularyEntry> = {
  'BPC-157': { cleared: true, blendEligible: true },
  'TB-500': { cleared: true, blendEligible: true },
  KPV: { cleared: true, blendEligible: true },
  'GHK-Cu': { cleared: true, blendEligible: true },
  Epitalon: { cleared: true, blendEligible: true },
  Sermorelin: { cleared: true, blendEligible: true },
  'CJC-1295': { cleared: true, blendEligible: true },
  Ipamorelin: { cleared: true, blendEligible: true },
  'AOD-9604': { cleared: true, blendEligible: true },
  Tesamorelin: { cleared: true, blendEligible: true },
  'MOTS-c': { cleared: true, blendEligible: true },
  'NAD+': { cleared: true, blendEligible: true },
  'PT-141': { cleared: true, blendEligible: true },
  Semaglutide: { cleared: true, blendEligible: false, note: 'Standalone 503A only' },
  Tirzepatide: { cleared: true, blendEligible: false, note: 'Standalone 503A only' },
}

export const isCleared = (compound: Compound): boolean => FORMULARY[compound]?.cleared ?? false

export const isBlendEligible = (compound: Compound): boolean =>
  FORMULARY[compound]?.blendEligible ?? false
