import type { AppProps } from 'next/app'
import '../styles/globals.css'
import { UIProvider } from '../components/ui/provider'
import ServiceBadge from '../components/ServiceBadge'
import TopNav from '../components/TopNav'
import { useRouter } from 'next/router'

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const path = router.pathname || ''
  const showTopNav = path.startsWith('/admin') || path === '/dashboard'
  const active = path.startsWith('/admin/requests')
    ? 'requests'
    : path.startsWith('/admin/users')
    ? 'users'
    : path.startsWith('/admin/settings')
    ? 'settings'
    : 'home'

  return (
    <div className="dark">
      <UIProvider>
        {showTopNav ? (
          <>
            <TopNav active={active as any} />
            <main className="p-6 min-h-[calc(100vh-64px)] bg-background">
              <Component {...pageProps} />
            </main>
          </>
        ) : (
          <Component {...pageProps} />
        )}
        <div className="fixed right-4 bottom-4 z-50">
          <ServiceBadge />
        </div>
      </UIProvider>
    </div>
  )
}
