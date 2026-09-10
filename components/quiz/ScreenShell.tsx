import type { ReactNode } from 'react'
import type { Register } from '@/lib/shared/types/content.types'

interface ScreenShellProps {
  heading: string
  body?: string[]
  register?: Register
  children?: ReactNode
  footer?: ReactNode
}

/**
 * The frame every quiz screen sits in.
 *
 * `register` is carried through from the content layer — the copy layer treats warm and
 * direct screens differently, and Phase 4 uses it to pick the type treatment rather than
 * each screen hardcoding one.
 */
export function ScreenShell({ heading, body, register, children, footer }: ScreenShellProps) {
  return (
    <main
      data-register={register}
      className="mx-auto flex w-full max-w-[430px] flex-1 flex-col gap-8 px-6 py-10"
    >
      <header className="flex flex-col gap-3">
        <h1 className="text-2xl leading-tight font-semibold text-balance">{heading}</h1>
        {body?.map((line) => (
          <p key={line} className="text-muted-foreground text-sm">
            {line}
          </p>
        ))}
      </header>

      {children}

      {footer ? <div className="mt-auto flex flex-col gap-3">{footer}</div> : null}
    </main>
  )
}
