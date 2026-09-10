import type { ReactNode } from 'react'
import type { Register } from '@/lib/shared/types/content.types'

import { cn } from '@/lib/shared/utils/cn'

/** The frames optically size the heading down as it gets longer: 32 / 30 / 28. */
type HeadingSize = 'lg' | 'md' | 'sm'

const HEADING_SIZE: Record<HeadingSize, string> = {
  lg: 'text-display',
  md: 'text-display-md',
  sm: 'text-display-sm',
}

interface ScreenShellProps {
  heading?: string
  headingSize?: HeadingSize
  body?: string[]
  register?: Register
  /** The welcome screen sits on the warmer "molten" ground. */
  ground?: 'field' | 'molten'
  header?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  /**
   * A bottom-anchored, full-bleed sheet. The education screen is drawn this way — it
   * reaches both edges and the bottom of the viewport, so it cannot sit inside the
   * padded column the question screens use.
   */
  sheet?: ReactNode
}

/**
 * The frame every quiz screen sits in.
 *
 * The frames are drawn at 402px. Built fluid to a max width and centred, so it holds
 * from a 320px phone up to a desktop window rather than only at the drawn size — the
 * wide layout is an extrapolation, since only a mobile frame exists.
 *
 * `min-h-dvh` rather than `vh`: mobile browsers shrink the viewport as the URL bar
 * hides, and the footer would otherwise sit under the browser chrome.
 */
export function ScreenShell({
  heading,
  headingSize = 'lg',
  body,
  register,
  ground = 'field',
  header,
  children,
  footer,
  sheet,
}: ScreenShellProps) {
  return (
    <div
      className={cn(
        'flex min-h-dvh flex-col',
        ground === 'molten' ? 'quiz-ground-molten' : 'quiz-ground',
      )}
    >
      <div
        data-register={register}
        className="mx-auto flex w-full max-w-[430px] flex-1 flex-col gap-6 px-[18px] pt-[14px] pb-[calc(18px+env(safe-area-inset-bottom))]"
      >
        {header}

        {heading || body ? (
          <header className="flex flex-col gap-3">
            {heading ? (
              <h1
                className={cn(
                  'font-display text-foreground font-medium',
                  HEADING_SIZE[headingSize],
                )}
              >
                {heading}
              </h1>
            ) : null}
            {body?.map((line) => (
              <p key={line} className="text-body text-foreground-secondary">
                {line}
              </p>
            ))}
          </header>
        ) : null}

        {children ? <div className="flex flex-col gap-[14px]">{children}</div> : null}

        {footer ? <div className="mt-auto flex flex-col gap-3 pt-6">{footer}</div> : null}
      </div>

      {sheet ? <div className="mx-auto w-full max-w-[430px]">{sheet}</div> : null}
    </div>
  )
}
