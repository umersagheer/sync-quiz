import type { ComponentType, SVGProps } from 'react'

/**
 * The four chip icons from the reveal frames, redrawn with `currentColor`.
 *
 * They are keyed by chip label rather than by compound: the frames reuse the same four
 * marks across different compounds' chips (`Systemic reach` and `Joint integrity` share
 * one), so the mapping belongs to the label, not the molecule.
 */
type IconProps = SVGProps<SVGSVGElement>

const svg = (props: IconProps) => ({
  width: 16,
  height: 16,
  viewBox: '0 0 16 16',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
  'aria-hidden': true as const,
  focusable: 'false' as const,
  ...props,
})

function RepairMark(props: IconProps) {
  return (
    <svg {...svg(props)}>
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeOpacity="0.9" strokeWidth="1.4" />
      <circle cx="8" cy="8" r="2" fill="currentColor" />
    </svg>
  )
}

function GutMark(props: IconProps) {
  return (
    <svg {...svg(props)}>
      <rect x="2" y="3.5" width="12" height="2.4" rx="1.2" fill="currentColor" fillOpacity="0.9" />
      <rect x="2" y="7.3" width="12" height="2.4" rx="1.2" fill="currentColor" fillOpacity="0.6" />
      <rect
        x="2"
        y="11.1"
        width="12"
        height="2.4"
        rx="1.2"
        fill="currentColor"
        fillOpacity="0.35"
      />
    </svg>
  )
}

function JointMark(props: IconProps) {
  return (
    <svg {...svg(props)}>
      <circle cx="5.5" cy="8" r="4.5" stroke="currentColor" strokeOpacity="0.9" strokeWidth="1.4" />
      <circle
        cx="10.5"
        cy="8"
        r="4.5"
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeWidth="1.4"
      />
    </svg>
  )
}

function SleepMark(props: IconProps) {
  return (
    <svg {...svg(props)}>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.8" strokeWidth="1.4" />
      <circle cx="12.5" cy="12.5" r="2.25" fill="currentColor" />
    </svg>
  )
}

const BY_LABEL: Record<string, ComponentType<IconProps>> = {
  'Tissue repair': RepairMark,
  Flexibility: RepairMark,
  'Gut lining': GutMark,
  'Cycle support': GutMark,
  'Joint integrity': JointMark,
  'Systemic reach': JointMark,
  'Recovery depth': SleepMark,
  Inflammation: SleepMark,
}

/** Falls back to the repair mark for chips the frames never drew. */
export const chipIcon = (label: string): ComponentType<IconProps> => BY_LABEL[label] ?? RepairMark
