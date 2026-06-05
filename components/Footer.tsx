import ReviaLogo from "./ReviaLogo";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative pb-10 pt-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="glass flex flex-col items-start justify-between gap-4 rounded-3xl p-5 shadow-soft sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <ReviaLogo height={47} />
            <span className="text-sm font-semibold text-revia-ink">
              — spatial memories.
            </span>
          </div>
          <div className="flex items-center gap-5 text-xs text-revia-slate">
            <a
              href="mailto:hello@revia.app"
              className="transition-colors hover:text-revia-ink"
            >
              hello@revia.app
            </a>
            <span aria-hidden className="h-1 w-1 rounded-full bg-revia-slate/40" />
            <span>© {year} Revia</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
