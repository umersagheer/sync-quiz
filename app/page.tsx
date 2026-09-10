const TOKEN_SWATCHES = [
  { name: 'background', className: 'bg-background' },
  { name: 'surface', className: 'bg-surface' },
  { name: 'surface-muted', className: 'bg-surface-muted' },
  { name: 'card', className: 'bg-card' },
  { name: 'primary', className: 'bg-primary' },
  { name: 'accent', className: 'bg-accent' },
  { name: 'glass', className: 'bg-glass' },
] as const

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-[430px] flex-1 flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-3">
        <p className="text-muted-foreground text-xs tracking-[0.18em] uppercase">SYNC · Quiz</p>
        <h1 className="text-3xl leading-tight font-semibold text-balance">Foundation is up.</h1>
        <p className="text-muted-foreground text-sm">
          Phase 0 scaffold. The quiz flow lands in Phase 3, screens in Phase 4.
        </p>
      </header>

      {/* Token check — every swatch below is generated from @theme in styles/globals.css.
          A blank row means the token pipeline is broken, which is otherwise invisible. */}
      <section
        aria-labelledby="tokens-heading"
        className="border-border bg-surface rounded-card flex flex-col gap-4 border p-5"
      >
        <h2
          id="tokens-heading"
          className="text-muted-foreground text-xs tracking-[0.18em] uppercase"
        >
          Design tokens — placeholder values
        </h2>
        <ul className="flex flex-wrap gap-3">
          {TOKEN_SWATCHES.map((token) => (
            <li key={token.name} className="flex flex-col items-center gap-1.5">
              <span
                aria-hidden="true"
                className={`${token.className} border-border-strong size-11 rounded-full border`}
              />
              <span className="text-muted-foreground text-[0.625rem]">{token.name}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-card text-card-foreground rounded-card flex flex-col gap-2 p-5">
        <p className="text-xs tracking-[0.18em] uppercase opacity-60">Cream surface</p>
        <p className="text-sm">
          The reveal fades from the maroon ground to this surface for protocol cards.
        </p>
      </section>
    </main>
  )
}
