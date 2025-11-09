import type { AppProps } from 'next/app'
import '../styles/globals.css'
import { UIProvider } from '../components/ui/provider'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="dark">
      <UIProvider>
        <Component {...pageProps} />
      </UIProvider>
    </div>
  )
}
