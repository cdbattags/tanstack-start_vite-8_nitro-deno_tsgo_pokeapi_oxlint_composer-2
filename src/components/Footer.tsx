import { SOURCE_REPO_URL } from '../site'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer mt-16 px-4 py-10 text-center text-sm text-[var(--sea-ink-soft)] sm:text-left">
      <div className="page-wrap flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="m-0 max-w-lg leading-relaxed">
          Unofficial fan tool over the public PokéAPI. Pokémon and related names are trademarks of their
          respective owners.
        </p>
        <p className="m-0 shrink-0 font-medium text-[var(--sea-ink)]">
          <a href={SOURCE_REPO_URL} className="no-underline hover:underline" target="_blank" rel="noreferrer">
            GitHub · {year}
          </a>
        </p>
      </div>
    </footer>
  )
}
