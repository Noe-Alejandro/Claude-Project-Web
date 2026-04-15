import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Settings,
  User,
  Users,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  Shield,
} from 'lucide-react'
import { cn } from '@shared/utils/cn'
import { useAuth } from '@shared/hooks/useAuth'
import { ROUTES } from '@shared/constants/routes'
import { getUserFullName } from '@domain/models/User'
import { Avatar } from '@presentation/components/ui/Avatar'
import { RoleBadge } from '@presentation/components/ui/Badge'
import { Button } from '@presentation/components/ui/Button'
import { SoftDivider } from '@presentation/components/ui/Surface'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Users', href: ROUTES.USERS, icon: <Users className="h-4 w-4" />, adminOnly: true },
  { label: 'Profile', href: ROUTES.PROFILE, icon: <User className="h-4 w-4" /> },
  { label: 'Settings', href: ROUTES.SETTINGS, icon: <Settings className="h-4 w-4" /> },
]

const roleThemes = {
  admin: {
    banner:
      'bg-[radial-gradient(circle_at_top_left,_rgba(244,114,182,0.35),_transparent_30%),linear-gradient(135deg,_rgba(76,29,149,0.95),_rgba(15,23,42,0.98))]',
    border: 'border-fuchsia-400/20',
    chip: 'bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-400/20',
    pulse: 'bg-emerald-400',
    title: 'System authority',
  },
  manager: {
    banner:
      'bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.28),_transparent_30%),linear-gradient(135deg,_rgba(120,53,15,0.92),_rgba(15,23,42,0.98))]',
    border: 'border-amber-400/20',
    chip: 'bg-amber-500/15 text-amber-100 border-amber-400/20',
    pulse: 'bg-emerald-400',
    title: 'Operations lead',
  },
  user: {
    banner:
      'bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.25),_transparent_30%),linear-gradient(135deg,_rgba(30,64,175,0.92),_rgba(15,23,42,0.98))]',
    border: 'border-blue-400/20',
    chip: 'bg-blue-500/15 text-blue-100 border-blue-400/20',
    pulse: 'bg-sky-400',
    title: 'Workspace member',
  },
  viewer: {
    banner:
      'bg-[radial-gradient(circle_at_top_left,_rgba(148,163,184,0.18),_transparent_30%),linear-gradient(135deg,_rgba(51,65,85,0.94),_rgba(15,23,42,0.98))]',
    border: 'border-slate-400/20',
    chip: 'bg-slate-500/15 text-slate-200 border-slate-400/20',
    pulse: 'bg-emerald-300',
    title: 'Read-only access',
  },
} as const

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async (): Promise<void> => {
    setIsLoggingOut(true)
    try {
      await logout() // clears token + dispatches LOGOUT to AuthContext
      navigate(ROUTES.LOGIN, { replace: true })
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (!user) return null

  const roleTheme = roleThemes[user.role]
  const footerBadges = [
    user.role === 'admin' ? 'Admin tools' : 'Team member',
    'Secure session',
    'Profile ready',
  ]

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.12),_transparent_20%),linear-gradient(180deg,_#0b1120_0%,_#020617_100%)] flex">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => {
            setSidebarOpen(false)
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-64 flex flex-col overflow-hidden',
          'bg-[linear-gradient(180deg,_#0f172a,_#0c1222)]',
          'transform transition-transform duration-300 ease-in-out will-change-transform',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:relative lg:translate-x-0',
        )}
      >
        <SoftDivider vertical />
        <div className="pointer-events-none absolute inset-y-0 -right-10 w-20 bg-[radial-gradient(circle_at_left,_rgba(167,139,250,0.18),_transparent_68%)]" />

        {/* Logo */}
        <div className="relative flex h-16 shrink-0 items-center gap-3 px-5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center shadow shadow-brand-900/50">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
              <path
                d="M12 2L3 7l9 5 9-5-9-5zM3 17l9 5 9-5M3 12l9 5 9-5"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-slate-100 font-semibold text-sm tracking-tight">EnterpriseApp</span>
          <button
            className="ml-auto lg:hidden text-slate-400 hover:text-slate-200"
            onClick={() => {
              setSidebarOpen(false)
            }}
          >
            <X className="h-5 w-5" />
          </button>
          <SoftDivider inset />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Navigation
          </p>
          {navItems
            .filter((item) => !item.adminOnly || user.role === 'admin')
            .map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === ROUTES.DASHBOARD}
                onClick={() => {
                  setSidebarOpen(false)
                }}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-brand-500/15 text-brand-300 border border-brand-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5',
                  )
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
        </nav>

        {/* User section */}
        <div className="relative shrink-0 p-3">
          <SoftDivider className="top-0 bottom-auto inset-x-4" />
          <div
            className={cn(
              'overflow-hidden rounded-[22px] border bg-slate-950/80 shadow-[0_18px_48px_-28px_rgba(0,0,0,0.9)]',
              roleTheme.border,
            )}
          >
            <div
              className={cn(
                'relative h-16 overflow-hidden border-b border-white/6',
                roleTheme.banner,
              )}
            >
              <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(255,255,255,0.04)_1px,_transparent_1px)] bg-[size:18px_18px] opacity-20" />
              <div className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
            </div>

            <div className="relative px-3 pb-3 pt-0">
              <div className="-mt-6 flex items-start gap-3">
                <div className="relative">
                  <Avatar
                    user={user}
                    size="lg"
                    className="border-4 border-slate-950 shadow-[0_12px_32px_-14px_rgba(0,0,0,1)]"
                  />
                  <span
                    className={cn(
                      'absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-slate-950',
                      roleTheme.pulse,
                    )}
                  />
                </div>

                <div className="min-w-0 flex-1 pt-7">
                  <p className="truncate text-sm font-semibold text-slate-100">
                    {getUserFullName(user)}
                  </p>
                  <p className="truncate text-xs text-slate-400">{user.email}</p>
                </div>
              </div>

              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <RoleBadge role={user.role} />
                  <span className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                    {roleTheme.title}
                  </span>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    About this account
                  </p>
                  <p className="mt-2 text-xs leading-5 text-slate-300">
                    Active workspace identity with quick access to profile, settings, and secure
                    session controls.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {footerBadges.map((badge) => (
                    <span
                      key={badge}
                      className={cn(
                        'rounded-full border px-2.5 py-1 text-[11px] font-medium',
                        roleTheme.chip,
                      )}
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-10 h-16 shrink-0 bg-slate-900/80 backdrop-blur-sm">
          <SoftDivider />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-[linear-gradient(180deg,_rgba(167,139,250,0.08),_transparent)] opacity-70" />
          <div className="flex h-full items-center gap-4 px-4 sm:px-6">
            <button
              className="lg:hidden text-slate-400 hover:text-slate-200 p-1"
              onClick={() => {
                setSidebarOpen(true)
              }}
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex-1" />

            {/* Notification bell */}
            <button
              className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-slate-950" />
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileMenuOpen((o) => !o)
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <Avatar user={user} size="sm" />
                <div className="hidden sm:block text-left">
                  <p className="text-slate-200 text-sm font-medium leading-none">
                    {getUserFullName(user)}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">{user.role}</p>
                </div>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-slate-500 transition-transform duration-200',
                    profileMenuOpen && 'rotate-180',
                  )}
                />
              </button>

              {profileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => {
                      setProfileMenuOpen(false)
                    }}
                  />
                  <div className="absolute right-0 top-full mt-2 z-20 w-56 overflow-hidden rounded-xl border border-white/[0.05] bg-[linear-gradient(180deg,_rgba(15,23,42,0.97),_rgba(15,23,42,0.94))] shadow-glass animate-fade-in backdrop-blur-sm">
                    {/* User info header */}
                    <div className="relative px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar user={user} size="sm" />
                        <div className="min-w-0">
                          <p className="text-slate-200 text-sm font-medium truncate">
                            {getUserFullName(user)}
                          </p>
                          <RoleBadge role={user.role} />
                        </div>
                      </div>
                      <SoftDivider inset className="inset-x-4" />
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <NavLink
                        to={ROUTES.PROFILE}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-slate-100 transition-colors"
                        onClick={() => {
                          setProfileMenuOpen(false)
                        }}
                      >
                        <User className="h-4 w-4 text-slate-500" />
                        Your Profile
                      </NavLink>
                      <NavLink
                        to={ROUTES.SETTINGS}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-slate-100 transition-colors"
                        onClick={() => {
                          setProfileMenuOpen(false)
                        }}
                      >
                        <Settings className="h-4 w-4 text-slate-500" />
                        Settings
                      </NavLink>
                      {user.role === 'admin' && (
                        <NavLink
                          to={ROUTES.USERS}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-slate-100 transition-colors"
                          onClick={() => {
                            setProfileMenuOpen(false)
                          }}
                        >
                          <Shield className="h-4 w-4 text-slate-500" />
                          Admin Panel
                        </NavLink>
                      )}
                    </div>

                    <div className="relative py-1">
                      <SoftDivider inset className="top-0 bottom-auto inset-x-4" />
                      <Button
                        variant="ghost"
                        size="sm"
                        fullWidth
                        isLoading={isLoggingOut}
                        leftIcon={<LogOut className="h-4 w-4" />}
                        className="justify-start px-4 text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-none"
                        onClick={() => {
                          setProfileMenuOpen(false)
                          void handleLogout()
                        }}
                      >
                        Sign out
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
