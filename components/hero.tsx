export function Hero() {
  return (
    <header className="relative pb-2 pt-8 text-center">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-secondary px-3 py-1 text-xs font-bold shadow-pop-sm">
        <span aria-hidden>🍽️</span>
        Food Decision Engine
      </div>

      <h1 className="font-display text-4xl font-extrabold leading-[0.95] tracking-tight text-ink sm:text-5xl">
        Makan
        <br />
        <span className="relative inline-block">
          <span className="relative z-10">apa?</span>
          {/* Hand-drawn underline accent under the question */}
          <svg
            className="absolute -bottom-1 left-0 z-0 w-full text-primary"
            viewBox="0 0 200 12"
            fill="none"
            aria-hidden
          >
            <path
              d="M2 8C40 3 80 3 120 6C150 8 180 5 198 4"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </h1>

      <p className="mx-auto mt-4 max-w-xs text-balance text-sm font-medium text-muted-foreground">
        Lagi bingung makan? Kami pilihkan. Tinggal berangkat.
      </p>
    </header>
  );
}
