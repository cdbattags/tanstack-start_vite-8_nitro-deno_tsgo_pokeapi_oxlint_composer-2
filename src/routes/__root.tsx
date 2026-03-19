import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { TrpcProvider } from '../integrations/trpc/react'
import { APP_DESCRIPTION, APP_TITLE, THEME_COLOR_DARK, THEME_COLOR_LIGHT } from '../site'

import appCss from '../styles.css?url'

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;var m=document.querySelector('meta[name="theme-color"]');if(m){m.setAttribute('content',resolved==='dark'?'${THEME_COLOR_DARK}':'${THEME_COLOR_LIGHT}')}}catch(e){}})();`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: APP_TITLE,
      },
      {
        name: 'description',
        content: APP_DESCRIPTION,
      },
      {
        name: 'theme-color',
        content: THEME_COLOR_LIGHT,
      },
      {
        property: 'og:title',
        content: APP_TITLE,
      },
      {
        property: 'og:description',
        content: APP_DESCRIPTION,
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        href: '/favicon.ico',
      },
      {
        rel: 'apple-touch-icon',
        href: '/logo192.png',
      },
      {
        rel: 'manifest',
        href: '/manifest.json',
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased wrap-anywhere">
        <TrpcProvider>
          <Header />
          {children}
          <Footer />
        </TrpcProvider>
        <Scripts />
      </body>
    </html>
  )
}
