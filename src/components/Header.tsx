import { Link } from '@tanstack/react-router'
import BrandMark from './BrandMark'
import ThemeToggle from './ThemeToggle'
import { APP_NAME, INDEX_SEARCH_DEFAULT, SOURCE_REPO_URL } from '../site'

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" aria-hidden="true" width="18" height="18">
      <path
        fill="currentColor"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"
      />
    </svg>
  )
}

export default function Header() {
  return (
    <header className="site-header sticky top-0 z-50 px-4">
      <nav
        className="page-wrap flex flex-wrap items-center gap-x-2 gap-y-3 py-3.5 sm:flex-nowrap sm:justify-between sm:py-4"
        aria-label="Primary"
      >
        <Link to="/" search={INDEX_SEARCH_DEFAULT} className="brand-lockup shrink-0">
          <BrandMark className="h-8 w-8 shrink-0" />
          <span className="brand-wordmark">{APP_NAME}</span>
        </Link>

        <div className="flex w-full flex-wrap items-center gap-1 sm:order-none sm:flex-1 sm:justify-center sm:px-4">
          <Link to="/" search={INDEX_SEARCH_DEFAULT} className="top-nav-link">
            Search
          </Link>
          <Link to="/about" className="top-nav-link">
            About
          </Link>
          <a
            href="https://pokeapi.co/docs/v2"
            className="top-nav-link"
            target="_blank"
            rel="noreferrer"
          >
            API reference
          </a>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:ml-0">
          <a
            href={SOURCE_REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-2 text-xs font-semibold text-[var(--sea-ink)] no-underline shadow-[0_6px_18px_rgba(15,45,51,0.06)] transition hover:-translate-y-0.5 sm:text-sm"
          >
            <GitHubIcon />
            Code
          </a>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
