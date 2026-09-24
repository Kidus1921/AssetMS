import { useQuery } from '@tanstack/react-query'
import { Bell, Moon, Plus, Search, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTheme } from '@/components/providers/ThemeProvider'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { topNavLinks } from '@/routes/navigation'
import { notificationsService } from '@/services/notifications.service'
import { assetsService } from '@/services/assets.service'
import { usersService } from '@/services/users.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function AppTopbar({ onOpenMobileNav }: { onOpenMobileNav?: () => void }) {
  const { theme, setTheme } = useTheme()
  const [search, setSearch] = useState('')
  const [resultsOpen, setResultsOpen] = useState(false)
  const navigate = useNavigate()

  const notifications = useQuery({ queryKey: ['notifications'], queryFn: () => notificationsService.list() })
  const user = useQuery({ queryKey: ['currentUser'], queryFn: () => usersService.getCurrent() })
  const searchQuery = useQuery({
    queryKey: ['globalSearch', search],
    queryFn: () => assetsService.getAll({ search }),
    enabled: search.trim().length > 1,
  })

  const unread = notifications.data?.filter((n) => !n.read).length ?? 0

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        document.getElementById('global-search')?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header className="sticky top-0 z-40 border-b bg-topbar text-white">
      <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 lg:hidden" onClick={onOpenMobileNav}>
          Menu
        </Button>
        <Link to="/dashboard" className="hidden items-center gap-2 sm:flex">
          <span className="rounded-md bg-primary px-2 py-1 text-xs font-bold text-primary-foreground">AMS</span>
          <span className="text-sm font-semibold">Assets</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {topNavLinks.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10',
                  isActive && 'bg-white/15 text-white',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="relative mx-auto hidden max-w-md flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
          <Input
            id="global-search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setResultsOpen(true)
            }}
            onFocus={() => setResultsOpen(true)}
            onBlur={() => setTimeout(() => setResultsOpen(false), 150)}
            placeholder="Search assets, tags, serial… (Ctrl+K)"
            className="border-white/20 bg-white/10 pl-9 text-white placeholder:text-white/50 focus-visible:ring-white/30"
          />
          {resultsOpen && search.trim().length > 1 ? (
            <div className="absolute left-0 right-0 top-full mt-1 rounded-lg border bg-background text-foreground shadow-lg">
              {(searchQuery.data ?? []).slice(0, 6).map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-muted"
                  onMouseDown={() => navigate(`/assets/${asset.id}`)}
                >
                  <span className="font-medium">{asset.name}</span>
                  <span className="text-xs text-muted-foreground">{asset.assetTag}</span>
                </button>
              ))}
              {!searchQuery.data?.length ? (
                <p className="px-3 py-2 text-sm text-muted-foreground">No matches</p>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Button asChild size="sm" className="hidden bg-primary sm:inline-flex">
            <Link to="/assets/new">
              <Plus className="h-4 w-4" />
              Add
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button asChild variant="ghost" size="icon" className="relative text-white hover:bg-white/10">
            <Link to="/notifications">
              <Bell className="h-4 w-4" />
              {unread ? (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px]">
                  {unread}
                </span>
              ) : null}
            </Link>
          </Button>
          <div className="ml-1 hidden items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-3 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {user.data?.name?.slice(0, 2).toUpperCase() ?? 'U'}
            </div>
            <span className="max-w-[120px] truncate text-xs">{user.data?.name ?? 'User'}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
