import Link from 'next/link'

/**
 * Placeholder for the clinical intake.
 *
 * The real handoff passes every §6 field by token into Bask EMR, the client's telehealth
 * partner. We have neither an endpoint nor credentials, so this route stands in — see
 * docs/BUILD_PLAN.md for the integration contract.
 */
export default function AssessmentPage() {
  return (
    <main className="mx-auto flex w-full max-w-[430px] flex-1 flex-col justify-center gap-4 px-6 py-10">
      <h1 className="text-2xl font-semibold text-balance">Your clinical assessment starts here.</h1>
      <p className="text-muted-foreground text-sm">
        This is where the handoff into the clinical intake happens. Everything you entered passes
        across by token — the intake does not ask any of it twice.
      </p>
      <p className="text-muted-foreground text-sm">
        The intake itself is a separate system and is not part of this demo.
      </p>
      <Link
        href="/"
        className="text-muted-foreground rounded-control focus-visible:ring-ring mt-4 py-2 text-xs underline focus-visible:ring-2"
      >
        Back to the start
      </Link>
    </main>
  )
}
