import type { ComponentType, SVGProps } from 'react'
import type { Lane } from '@/lib/shared/types/quiz.types'

/**
 * The five lane icons, transcribed from the `icon/*` frames on `SYNC · Quiz LG — S5`.
 *
 * In Figma these are composed primitives rather than vectors, so they are redrawn here
 * with the same geometry. Every stroke and fill is `currentColor` — the design flips the
 * icon to the accent when its option is selected, so colour has to come from the parent
 * rather than being baked in. The relative opacities are kept, since they are what gives
 * each mark its depth.
 */
type IconProps = SVGProps<SVGSVGElement>

const base = (props: IconProps) => ({
  width: 28,
  height: 28,
  viewBox: '0 0 28 28',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
  'aria-hidden': true as const,
  focusable: 'false' as const,
  ...props,
})

export function RepairIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="14" cy="14" r="10" stroke="currentColor" strokeOpacity="0.95" strokeWidth="2" />
      <circle cx="22" cy="6" r="3.5" fill="currentColor" />
    </svg>
  )
}

export function PerformIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="17" width="4.5" height="8" rx="2.25" fill="currentColor" fillOpacity="0.65" />
      <rect
        x="12"
        y="12"
        width="4.5"
        height="13"
        rx="2.25"
        fill="currentColor"
        fillOpacity="0.85"
      />
      <rect x="20" y="6" width="4.5" height="19" rx="2.25" fill="currentColor" />
    </svg>
  )
}

export function DefineIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="14" cy="14" r="11" stroke="currentColor" strokeOpacity="0.95" strokeWidth="3" />
      <circle cx="14" cy="14" r="4.5" stroke="currentColor" strokeOpacity="0.55" strokeWidth="2" />
    </svg>
  )
}

export function RestoreIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="14" cy="14" r="7.5" stroke="currentColor" strokeOpacity="0.95" strokeWidth="2" />
      <rect x="13" width="2" height="5" rx="1" fill="currentColor" fillOpacity="0.9" />
      <rect x="13" y="23" width="2" height="5" rx="1" fill="currentColor" fillOpacity="0.9" />
      <rect y="13" width="5" height="2" rx="1" fill="currentColor" fillOpacity="0.9" />
      <rect x="23" y="13" width="5" height="2" rx="1" fill="currentColor" fillOpacity="0.9" />
    </svg>
  )
}

export function Pt141Icon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="10" cy="14" r="7.5" stroke="currentColor" strokeOpacity="0.95" strokeWidth="2" />
      <circle cx="18" cy="14" r="7.5" stroke="currentColor" strokeOpacity="0.6" strokeWidth="2" />
    </svg>
  )
}

export const LANE_ICONS: Record<Lane, ComponentType<IconProps>> = {
  REPAIR: RepairIcon,
  PERFORM: PerformIcon,
  DEFINE: DefineIcon,
  RESTORE: RestoreIcon,
  PT141: Pt141Icon,
}
