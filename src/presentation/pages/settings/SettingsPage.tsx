import React, { useState } from 'react'
import { Bell, Moon, Globe, Shield, Save } from 'lucide-react'
import { useAuth } from '@shared/hooks/useAuth'
import { Card } from '@presentation/components/ui/Card'
import { Button } from '@presentation/components/ui/Button'

const SettingsPage: React.FC = () => {
  const { user } = useAuth()
  const [saved, setSaved] = useState(false)

  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    securityAlerts: true,
    darkMode: true,
    language: 'en',
    timezone: 'UTC',
  })

  const toggle = (key: keyof typeof prefs) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }))
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
    }, 2000)
  }

  if (!user) return null

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-slate-400">Manage your account preferences</p>
      </div>

      {/* Notifications */}
      <Card padding="none">
        <SectionHeader icon={<Bell className="h-4 w-4" />} title="Notifications" />
        <div className="divide-y divide-white/5 px-5">
          <ToggleRow
            label="Email notifications"
            description="Receive email updates about activity in your workspace"
            checked={prefs.emailNotifications}
            onChange={() => {
              toggle('emailNotifications')
            }}
          />
          <ToggleRow
            label="Security alerts"
            description="Get notified about sign-ins from new devices or locations"
            checked={prefs.securityAlerts}
            onChange={() => {
              toggle('securityAlerts')
            }}
          />
        </div>
      </Card>

      {/* Appearance */}
      <Card padding="none">
        <SectionHeader icon={<Moon className="h-4 w-4" />} title="Appearance" />
        <div className="divide-y divide-white/5 px-5">
          <ToggleRow
            label="Dark mode"
            description="Use the dark color scheme across the application"
            checked={prefs.darkMode}
            onChange={() => {
              toggle('darkMode')
            }}
          />
        </div>
      </Card>

      {/* Language & region */}
      <Card padding="none">
        <SectionHeader icon={<Globe className="h-4 w-4" />} title="Language & Region" />
        <div className="px-5 py-4 space-y-4">
          <SelectRow
            label="Language"
            value={prefs.language}
            options={[
              { value: 'en', label: 'English' },
              { value: 'es', label: 'Español' },
            ]}
            onChange={(v) => {
              setPrefs((p) => ({ ...p, language: v }))
            }}
          />
          <SelectRow
            label="Timezone"
            value={prefs.timezone}
            options={[
              { value: 'UTC', label: 'UTC' },
              { value: 'America/New_York', label: 'Eastern Time (ET)' },
              { value: 'America/Chicago', label: 'Central Time (CT)' },
              { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
              { value: 'Europe/London', label: 'London (GMT)' },
              { value: 'Europe/Berlin', label: 'Berlin (CET)' },
            ]}
            onChange={(v) => {
              setPrefs((p) => ({ ...p, timezone: v }))
            }}
          />
        </div>
      </Card>

      {/* Security */}
      <Card padding="none">
        <SectionHeader icon={<Shield className="h-4 w-4" />} title="Security" />
        <div className="px-5 py-4">
          <p className="text-sm text-slate-400 mb-4">
            To change your password or enable two-factor authentication, contact your administrator.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            Account is secured with password authentication
          </div>
        </div>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSave}>
          {saved ? 'Saved!' : 'Save preferences'}
        </Button>
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
  <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/8">
    <span className="text-slate-400">{icon}</span>
    <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
  </div>
)

const ToggleRow: React.FC<{
  label: string
  description: string
  checked: boolean
  onChange: () => void
}> = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between gap-4 py-4">
    <div className="min-w-0">
      <p className="text-sm font-medium text-slate-200">{label}</p>
      <p className="text-xs text-slate-500 mt-0.5">{description}</p>
    </div>
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent
        transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500
        ${checked ? 'bg-brand-600' : 'bg-white/15'}`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow
          transition duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`}
      />
    </button>
  </div>
)

const SelectRow: React.FC<{
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}> = ({ label, value, options, onChange }) => (
  <div className="flex items-center justify-between gap-4">
    <label className="text-sm text-slate-300 shrink-0">{label}</label>
    <select
      value={value}
      onChange={(e) => {
        onChange(e.target.value)
      }}
      className="bg-white/5 border border-white/10 text-slate-200 text-sm rounded-lg px-3 py-1.5
        focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50
        cursor-pointer min-w-[160px]"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-slate-800">
          {o.label}
        </option>
      ))}
    </select>
  </div>
)

export default SettingsPage
