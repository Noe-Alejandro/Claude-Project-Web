import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Settings,
  User,
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
import { useLogoutMutation } from '@application/auth/useAuthQueries'
import { Button } from '@presentation/components/ui/Button'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Profile', href: ROUTES.PROFILE, icon: <User className="h-4 w-4" /> },
  { label: 'Settings', href: ROUTES.SETTINGS, icon: <Settings className="h-4 w-4" /> },
]

export const AppLayout: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const logoutMutation = useLogoutMutation(() => {
    void navigate(ROUTES.LOGIN, { replace: true })
  })

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-64 flex flex-col',
          'bg-slate-900/95 backdrop-blur-sm border-r border-white/8',
          'transform transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:relative lg:translate-x-0',
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 h-16 px-5 border-b border-white/8 shrink-0">
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
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Navigation
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === ROUTES.DASHBOARD}
              onClick={() => setSidebarOpen(false)}
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
        <div className="p-3 border-t border-white/8 shrink-0">
          <div className="flex items-center gap-3 p-2 rounded-lg">
            <Avatar user={user} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-slate-200 text-sm font-medium truncate">{getUserFullName(user)}</p>
              <p className="text-slate-500 text-xs truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 flex items-center gap-4 px-4 sm:px-6 border-b border-white/8 bg-slate-900/50 backdrop-blur-sm shrink-0 sticky top-0 z-10">
          <button
            className="lg:hidden text-slate-400 hover:text-slate-200 p-1"
            onClick={() => setSidebarOpen(true)}
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
              onClick={() => setProfileMenuOpen((o) => !o)}
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
                  onClick={() => setProfileMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 z-20 rounded-xl border border-white/8 bg-slate-900 shadow-glass overflow-hidden animate-fade-in">
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-white/8">
                    <div className="flex items-center gap-3">
                      <Avatar user={user} size="sm" />
                      <div className="min-w-0">
                        <p className="text-slate-200 text-sm font-medium truncate">
                          {getUserFullName(user)}
                        </p>
                        <RoleBadge role={user.role} />
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <NavLink
                      to={ROUTES.PROFILE}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-slate-100 transition-colors"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <User className="h-4 w-4 text-slate-500" />
                      Your Profile
                    </NavLink>
                    <NavLink
                      to={ROUTES.SETTINGS}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-slate-100 transition-colors"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 text-slate-500" />
                      Settings
                    </NavLink>
                    {user.role === 'admin' && (
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-slate-100 transition-colors">
                        <Shield className="h-4 w-4 text-slate-500" />
                        Admin Panel
                      </button>
                    )}
                  </div>

                  <div className="border-t border-white/8 py-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      fullWidth
                      isLoading={logoutMutation.isPending}
                      leftIcon={<LogOut className="h-4 w-4" />}
                      className="justify-start px-4 text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-none"
                      onClick={() => {
                        setProfileMenuOpen(false)
                        logoutMutation.mutate()
                      }}
                    >
                      Sign out
                    </Button>
                  </div>
                </div>
              </>
            )}
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
