'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  Bell,
  Settings,
  MapPin,
  LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/calendar', label: 'Calendrier', icon: CalendarDays },
  { href: '/alerts', label: 'Alertes', icon: Bell },
  { href: '/settings', label: 'Paramètres', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-[#1E293B] bg-[#0F172A]">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-[#1E293B] px-6">
        <MapPin className="h-5 w-5 text-[#22C55E]" strokeWidth={2.5} />
        <span className="text-base font-bold tracking-tight text-[#F8FAFC]">
          PasseFrontière
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-4" aria-label="Navigation principale">
        <ul className="space-y-1" role="list">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={[
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 cursor-pointer',
                    isActive
                      ? 'bg-[#1E293B] text-[#F8FAFC]'
                      : 'text-[#64748B] hover:bg-[#1E293B]/60 hover:text-[#F8FAFC]',
                  ].join(' ')}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" strokeWidth={1.75} />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Sign out */}
      <div className="border-t border-[#1E293B] p-4">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#64748B] transition-colors duration-150 hover:bg-[#1E293B]/60 hover:text-[#EF4444] cursor-pointer"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" strokeWidth={1.75} />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
