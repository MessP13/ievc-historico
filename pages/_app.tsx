// pages/_app.tsx
import type { AppProps } from 'next/app'
import { appWithTranslation } from 'next-i18next'
import { Toaster } from 'react-hot-toast'
import { Playfair_Display, Source_Serif_4 } from 'next/font/google'
import '@/styles/globals.css'

const displayFont = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const bodyFont = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '600'],
  display: 'swap',
})

function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`${displayFont.variable} ${bodyFont.variable} font-body`}>
      <Component {...pageProps} />
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#2d1c14',
            color: '#fef7ee',
            fontFamily: 'var(--font-body)',
            fontSize: '1rem',
            padding: '12px 20px',
            borderRadius: '12px',
          },
        }}
      />
    </main>
  )
}

export default appWithTranslation(App)
