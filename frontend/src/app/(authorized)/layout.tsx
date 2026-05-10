'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAtomValue, useSetAtom } from 'jotai'
import { tokenAtom, userAtom } from '@/lib/stores/auth-store'
import { logout } from '@/lib/apis/auth'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/events', label: 'Event', icon: '📅' },
]

export default function AuthorizedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const user = useAtomValue(userAtom)
  const setToken = useSetAtom(tokenAtom)
  const setUser = useSetAtom(userAtom)

  async function handleLogout() {
    try { await logout() } catch { /* ignore */ }
    setToken(null)
    setUser(null)
    document.cookie = 'sportival_token=; path=/; max-age=0'
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden w-60 flex-col border-r bg-white lg:flex">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="text-xl font-bold text-blue-900">Sportival</Link>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                pathname.startsWith(item.href)
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t p-3">
          <div className="px-3 py-2 text-xs text-gray-500">
            <p className="font-medium text-gray-900">{user?.name ?? 'Admin'}</p>
            <p className="capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
          <button
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-white px-6">
          <h2 className="text-base font-semibold text-gray-800">
            {navItems.find((n) => pathname.startsWith(n.href))?.label ?? 'Admin'}
          </h2>
          <span className="text-sm text-gray-500">{user?.name}</span>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
