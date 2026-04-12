import React from 'react'
import { Outlet } from 'react-router-dom'

export const AuthLayout: React.FC = () => (
  <div className="min-h-screen bg-slate-950 flex">
    {/* Left panel — branding */}
    <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-slate-900 to-slate-950" />

      {/* Decorative orbs */}
      <div className="absolute -top-40 -left-20 h-[500px] w-[500px] rounded-full bg-brand-600/20 blur-[120px]" />
      <div className="absolute -bottom-40 right-0 h-[600px] w-[600px] rounded-full bg-brand-800/20 blur-[140px]" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Content */}
      <div className="relative flex flex-col justify-between p-12 w-full">
        <div className="flex items-center gap-3">
          <LogoMark />
          <span className="text-white font-semibold text-lg tracking-tight">EnterpriseApp</span>
        </div>

        <div className="space-y-6 max-w-md">
          <div className="space-y-4">
            <blockquote className="text-slate-200 text-xl font-light leading-relaxed">
              "Built for teams that demand security, speed, and scalability without compromise."
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-sm font-semibold">
                AM
              </div>
              <div>
                <p className="text-slate-200 text-sm font-medium">Alex Morgan</p>
                <p className="text-slate-500 text-xs">CTO, Acme Corp</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10">
            {[
              { label: 'Uptime', value: '99.9%' },
              { label: 'Users', value: '50K+' },
              { label: 'Requests/s', value: '1M+' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-slate-400 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-600 text-xs">
          © {new Date().getFullYear()} EnterpriseApp. All rights reserved.
        </p>
      </div>
    </div>

    {/* Right panel — form */}
    <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative">
      {/* Mobile logo */}
      <div className="lg:hidden mb-10 flex items-center gap-2">
        <LogoMark />
        <span className="text-white font-semibold text-lg">EnterpriseApp</span>
      </div>

      <div className="w-full max-w-sm animate-slide-up">
        <Outlet />
      </div>
    </div>
  </div>
)

const LogoMark: React.FC = () => (
  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-900/50">
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <path
        d="M12 2L3 7l9 5 9-5-9-5zM3 17l9 5 9-5M3 12l9 5 9-5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
)
