import { ChevronDown, LogOut, PanelLeftClose, PanelLeftOpen, Settings } from 'lucide-react'
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { mainNav, type NavItem } from '@/routes/navigation'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

function NavLinkItem({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const location = useLocation()
  const isActive = item.href ? location.pathname === item.href || location.pathname.startsWith(`${item.href}/`) : false
  const Icon = item.icon

  if (!item.href) return null

  return (
    <NavLink
      to={item.href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive ? 'bg-primary text-primary-foreground' : 'text-sidebar-foreground hover:bg-muted',
        collapsed && 'justify-center px-2',
      )}
      title={collapsed ? item.title : undefined}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0" /> : <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />}
      {!collapsed ? <span className="truncate">{item.title}</span> : null}
    </NavLink>
  )
}

function NavGroup({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const location = useLocation()
  const childActive = item.children?.some(
    (c) => c.href && (location.pathname === c.href || location.pathname.startsWith(`${c.href}/`)),
  )
  const [open, setOpen] = useState(childActive ?? true)
  const Icon = item.icon

  if (!item.children?.length) return <NavLinkItem item={item} collapsed={collapsed} />

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-muted',
          collapsed && 'justify-center px-2',
        )}
      >
        {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
        {!collapsed ? (
          <>
            <span className="flex-1 truncate text-left">{item.title}</span>
            <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
          </>
        ) : null}
      </button>
      {!collapsed && open ? (
        <div className="ml-3 mt-1 space-y-0.5 border-l pl-3">
          {item.children.map((child) => (
            <NavLinkItem key={child.href ?? child.title} item={child} collapsed={false} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function AppSidebar({ mobile }: { mobile?: boolean }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r bg-sidebar',
        mobile ? 'w-full' : collapsed ? 'w-[72px]' : 'w-64',
      )}
    >
      <div className={cn('flex items-center gap-2 px-4 py-4', collapsed && !mobile && 'justify-center px-2')}>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          AM
        </div>
        {(!collapsed || mobile) && (
          <div>
            <p className="text-sm font-semibold">Asset Management</p>
            <p className="text-xs text-muted-foreground">Enterprise Registry</p>
          </div>
        )}
      </div>
      <Separator />
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {mainNav.map((item) => (
          <NavGroup key={item.title} item={item} collapsed={!mobile && collapsed} />
        ))}
      </nav>
      <div className="space-y-1 border-t p-3">
        <NavLinkItem item={{ title: 'Settings', href: '/settings', icon: Settings }} collapsed={!mobile && collapsed} />
        <button
          type="button"
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted',
            !mobile && collapsed && 'justify-center px-2',
          )}
        >
          <LogOut className="h-4 w-4" />
          {!mobile && !collapsed ? 'Logout' : null}
        </button>
        {!mobile ? (
          <Button variant="ghost" size="sm" className="mt-1 w-full" onClick={() => setCollapsed((v) => !v)}>
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            {!collapsed ? 'Collapse' : null}
          </Button>
        ) : null}
      </div>
    </aside>
  )
}
