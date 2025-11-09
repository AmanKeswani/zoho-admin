import type { AppProps } from 'next/app'
import '../styles/globals.css'
import { UIProvider } from '../components/ui/provider'
import ServiceBadge from '../components/ServiceBadge'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="dark">
      <UIProvider>
        <Component {...pageProps} />
        <div className="fixed right-4 bottom-4 z-50">
          <ServiceBadge />
        </div>
      </UIProvider>
    </div>
  )
}
